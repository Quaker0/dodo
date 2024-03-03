import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "types/socket-types";
import { TodoTask, TodoList } from "types/todo-types";
import { uid } from "uid";
import { pick } from "lodash";
import { InMemorySessionStore } from "./sessionStore";
import { List, Todo } from "./todoClasses";
import { addListListeners, getTodoLists } from "./helpers";
import helmet from "helmet";

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

const lists: Record<string, TodoList> = {};
const todos: Record<string, Record<string, TodoTask>> = {};

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

  const joinedLists = getTodoLists(session.rooms, lists);
  socket.timeout(1000).emit("todoLists", joinedLists);
  socket.timeout(1000).emit(
    "todos",
    pick(
      todos,
      joinedLists.map((l) => l.id)
    )
  );

  socket.on("createTodoList", (title, callback) => {
    if (!title) {
      return callback({ success: false, err: "Missing title" });
    }
    const newList = new List(title);
    lists[newList.id] = newList;
    addListListeners(socket, sessionStore, newList.id);
    socket.emit("list", newList);
    callback({ success: true, id: newList.id });
  });

  socket.on("joinList", (listId, callback) => {
    if (listId in lists) {
      socket.join(listId);
      if (!sessionStore.findSession(listId)) {
        addListListeners(socket, sessionStore, listId);
        const joinedLists = getTodoLists(session.rooms, lists);
        socket.timeout(1000).emit("todoLists", joinedLists);
        socket.timeout(1000).emit(
          "todos",
          pick(
            todos,
            joinedLists.map((l) => l.id)
          )
        );
      }
      callback({ success: true });
    } else {
      callback({ success: false, err: "Todo list does not exist" });
    }
  });

  socket.on("newTodo", (listId, subject, callback) => {
    const newTodo = new Todo(listId, subject, false);
    if (!lists[listId] || !newTodo.isValid()) {
      callback({ success: true, err: "Invalid parameters" });
    }
    if (!todos[listId]) {
      todos[listId] = {};
    }
    todos[listId][newTodo.id] = newTodo;
    lists[listId].order.push(newTodo.id);

    io.to(listId).emit("todo", listId, newTodo);
    io.to(listId).emit("list", lists[listId]);
    callback({ success: true });
  });

  socket.on("updateTodo", (listId, todo, callback) => {
    if (!Todo.isValid(todo)) {
      return callback({ success: false, err: "Invalid todo schema" });
    }
    todos[listId][todo.id] = todo;
    io.to(listId).emit("todo", listId, todo);
    callback({ success: true });
  });

  function removeChildFromParent(parentId: string, childTodoId: string) {
    if (!lists[parentId]) return;
    const idxToRemove = lists[parentId].order?.indexOf(childTodoId);
    if (idxToRemove != null && idxToRemove >= 0) {
      lists[parentId].order.splice(idxToRemove, 1);
    }

    if (!lists[parentId].order?.length && !lists[parentId].grandfather) {
      // If last child, remove parent->child link entirely
      delete lists[parentId];
    }
  }

  function moveChildrenToGrandparent(
    listId: string,
    todoId: string,
    fromParentId: string,
    toParentId: string
  ) {
    const idx = lists[fromParentId].order.indexOf(todoId);
    lists[todoId].order.forEach((orphanedTodoId) => {
      lists[fromParentId].order.splice(idx, 0, orphanedTodoId);
      todos[listId][orphanedTodoId].parentId = fromParentId;
      removeChildFromParent(todoId, orphanedTodoId);
    });
    removeChildFromParent(toParentId, todoId);
    delete lists[todoId];
  }

  function appendChild(todoId: string, toParentId: string, toOrderIdx: number) {
    const newOrder = [...lists[toParentId].order];
    newOrder.splice(toOrderIdx, 0, todoId);
    lists[toParentId] = { ...lists[toParentId], order: newOrder };
  }

  socket.on("moveTodo", (listId, todoId, toParentId, toOrderIdx, callback) => {
    if (
      !listId ||
      !todoId ||
      !toParentId ||
      !isFinite(toOrderIdx) ||
      toOrderIdx < 0
    ) {
      return callback({ success: false, err: "Invalid parameters" });
    }

    const fromParentId = todos[listId][todoId].parentId || listId;
    if (lists[todoId]) {
      // Swapping tasks in the same tree, will create orphans unless we move children up one step
      moveChildrenToGrandparent(listId, todoId, fromParentId, toParentId);
    }
    removeChildFromParent(fromParentId, todoId);

    if (!lists[toParentId]) {
      // toParentId is a main task, create the parent->child link
      lists[toParentId] = {
        id: toParentId,
        grandfather: false,
        order: [todoId],
      };
    } else {
      appendChild(todoId, toParentId, toOrderIdx);
    }

    todos[listId][todoId].parentId = toParentId;

    addListListeners(
      socket,
      sessionStore,
      listId,
      todoId,
      toParentId,
      fromParentId
    );
    io.to(listId).timeout(1000).emit("todo", listId, todos[listId][todoId]);
    io.to(listId)
      .timeout(1000)
      .emit("todoLists", getTodoLists(session.rooms, lists));

    callback({ success: true });
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
