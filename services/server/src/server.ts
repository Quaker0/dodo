import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "types/socket-types";
import { uid } from "uid";
import TodoListDB from "./TodoListDB";
import TodoTaskDB from "./TodoTaskDB";
import { addListListeners } from "./helpers";
import { InMemorySessionStore } from "./sessionStore";
import { List, Todo as Task } from "./todoClasses";

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  undefined,
  SocketData
>(server, {
  cors: {
    origin: ["localhost", "niclas.tech"],
  },
});
const sessionStore = new InMemorySessionStore();
const todoListDB = new TodoListDB();
const todoTaskDB = new TodoTaskDB();

app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());

app.get("/health", (req, res) => {
  res.status(200).send("Okay");
});

io.use((socket, next) => {
  const sessionId = socket.handshake.auth.sessionId;
  if (sessionId) {
    const session = sessionStore.findSession(sessionId);
    if (session) {
      socket.data.sessionId = sessionId;
      return next();
    }
  } else {
    socket.data.sessionId = uid(16);
  }
  return next();
});

io.on("connection", (socket) => {
  sessionStore.createSessionIfNotExists(socket.data.sessionId, {
    sessionId: socket.data.sessionId,
  });
  const session = sessionStore.findSession(socket.data.sessionId);
  session.rooms?.forEach((room) => socket.join(room));
  socket.emit("session", {
    sessionId: socket.data.sessionId,
  });

  const joinedLists = [...(session.rooms || [])]
    .map((listId) => todoListDB.get(listId))
    .filter(Boolean);
  socket.timeout(1000).emit("lists", joinedLists);
  socket
    .timeout(1000)
    .emit("tasks", todoTaskDB.list(joinedLists.map((l) => l.id)));

  socket.on("createTodoList", (title, callback) => {
    if (!title) {
      return callback({ success: false, err: "Missing title" });
    }
    const newList = new List(title);
    todoListDB.set(newList);
    addListListeners(socket, sessionStore, newList.id);
    socket.timeout(1000).emit("list", newList);
    callback({ success: true, id: newList.id });
  });

  socket.on("joinList", (listId, callback) => {
    if (todoListDB.exists(listId)) {
      socket.join(listId);
      if (!sessionStore.findSession(listId)) {
        addListListeners(socket, sessionStore, listId);
        const joinedLists = [...(session.rooms || [])]
          .map((listId) => todoListDB.get(listId))
          .filter(Boolean);
        socket.timeout(1000).emit("lists", joinedLists);
        socket
          .timeout(1000)
          .emit("tasks", todoTaskDB.list(joinedLists.map((l) => l.id)));
      }
      callback({ success: true });
    } else {
      callback({ success: false, err: "Todo list does not exist" });
    }
  });

  socket.on("createTask", (listId, subject, callback) => {
    const newTask = new Task(listId, subject, false);
    if (!todoListDB.exists(listId) || !newTask.isValid()) {
      callback({ success: false, err: "Invalid parameters" });
    }
    todoTaskDB.set(newTask);
    todoListDB.addChildLink(listId, newTask.id);

    io.to(listId).emit("task", listId, newTask);
    io.to(listId).emit("list", todoListDB.get(listId));
    callback({ success: true });
  });

  socket.on("updateTask", (listId, task, callback) => {
    if (!Task.isValid(task)) {
      return callback({ success: false, err: "Invalid todo schema" });
    }
    todoTaskDB.set(task);
    io.to(listId).emit("task", listId, task);
    callback({ success: true });
  });

  function removeChildFromParent(parentId: string, childTodoId: string) {
    if (!todoListDB.exists(parentId)) {
      return;
    }
    todoListDB.removeChildLink(parentId, childTodoId);

    const parentList = todoListDB.get(parentId);
    if (!parentList.order?.length && !parentList.main) {
      // If last child, remove parent->child link entirely
      todoListDB.remove(parentId);
    }
  }

  function moveChildrenToGrandparent(
    listId: string,
    taskId: string,
    fromParentId: string,
    toParentId: string
  ) {
    const orderIdx = todoListDB.get(fromParentId).order.indexOf(taskId);
    todoListDB.get(taskId).order.forEach((orphanedTodoId) => {
      todoListDB.addChildLink(fromParentId, orphanedTodoId, orderIdx);
      todoTaskDB.setParentId(listId, orphanedTodoId, fromParentId);
      removeChildFromParent(taskId, orphanedTodoId);
    });
    removeChildFromParent(toParentId, taskId);
    todoListDB.remove(taskId);
  }

  socket.on("moveTask", (listId, taskId, toParentId, toOrderIdx, callback) => {
    if (
      !listId ||
      !taskId ||
      !toParentId ||
      !isFinite(toOrderIdx) ||
      toOrderIdx < 0
    ) {
      return callback({ success: false, err: "Invalid parameters" });
    }

    const fromParentId = todoTaskDB.get(listId, taskId).parentId || listId;
    if (todoListDB.exists(taskId)) {
      // The task has children, move children up one step to not create orphans
      moveChildrenToGrandparent(listId, taskId, fromParentId, toParentId);
    }
    removeChildFromParent(fromParentId, taskId);

    if (!todoListDB.exists(toParentId)) {
      // toParentId is a main task, create the parent->child link
      todoListDB.set({
        id: toParentId,
        main: false,
        order: [taskId],
      });
    } else {
      todoListDB.addChildLink(toParentId, taskId, toOrderIdx);
    }

    todoTaskDB.setParentId(listId, taskId, toParentId);

    addListListeners(
      socket,
      sessionStore,
      listId,
      taskId,
      toParentId,
      fromParentId
    );
    io.to(listId)
      .timeout(1000)
      .emit("task", listId, todoTaskDB.get(listId, taskId));
    io.to(listId)
      .timeout(1000)
      .emit(
        "lists",
        [...(session.rooms || [])]
          .map((listId) => todoListDB.get(listId))
          .filter(Boolean)
      );

    callback({ success: true });
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
