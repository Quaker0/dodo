import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "types/socket-types";
import { Todo, TodoList } from "types/todo-types";
import cors from "cors";
import { uid } from "uid";

import { InMemorySessionStore } from "./sessionStore";

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
>(server, { cors: { origin: "http://localhost" } });
const sessionStore = new InMemorySessionStore();

function getTodoLists(rooms: Set<string>) {
  return [...(rooms || [])].map((listId) => lists[listId]).filter(Boolean);
}

io.use((socket, next) => {
  const sessionId = socket.handshake.auth.sessionId;
  console.log("socket.handshake.auth sessionId", sessionId);
  if (sessionId) {
    const session = sessionStore.findSession(sessionId);
    if (session) {
      console.log("found matching session");
      socket.data.sessionId = sessionId;
      return next();
    }
  } else {
    console.log("creating new session");
    socket.data.sessionId = uid(16);
  }
  return next();
});

const lists: Record<string, TodoList> = {};
const todos: Record<string, Record<string, Todo>> = {};

app.get("/lists/:listId", (req, res) => {
  console.log("req.params", req.params);
  if (!(req.params.listId in lists)) {
    res.status(404).send("Todo list not found");
  }
  res.json(lists[req.params.listId]);
});

app.get("/lists/:listId/todos", (req, res) => {
  if (!(req.params.listId in lists)) {
    res.status(404).send("Todo list not found");
  }
  res.json(todos[req.params.listId]);
});

app.get("/todos", (req, res) => {
  res.json(todos);
});

io.on("connection", (socket) => {
  console.log("connection");
  sessionStore.createSessionIfNotExists(socket.data.sessionId, {
    sessionId: socket.data.sessionId,
  });
  const session = sessionStore.findSession(socket.data.sessionId);
  console.log("rooms", session.rooms);
  session.rooms?.forEach((room) => socket.join(room));

  socket.emit("session", {
    sessionId: socket.data.sessionId,
  });

  socket.timeout(1000).emit("todoLists", getTodoLists(session.rooms));

  socket.on("createTodoList", (title, callback) => {
    if (!title) {
      return callback({ success: false, err: "Missing title" });
    }
    const newList = {
      id: uid(),
      title,
      createdAt: Date.now(),
      items: {},
    };
    lists[newList.id] = newList;
    sessionStore.addRoom(socket.data.sessionId, newList.id);
    socket.join(newList.id);
    socket.timeout(1000).emit("todoLists", getTodoLists(session.rooms));
    callback({ success: true, id: newList.id });
  });

  socket.on("joinList", (listId, callback) => {
    if (listId in lists) {
      console.log("joinList", listId);
      socket.join(listId);
      if (!sessionStore.findSession(listId)) {
        sessionStore.addRoom(socket.data.sessionId, listId);
        socket.timeout(1000).emit("todoLists", getTodoLists(session.rooms));
      }
      console.log("joined list", listId, socket.rooms);
      callback({ success: true });
    } else {
      console.log("joinList failed", listId);
      callback({ success: false, err: "Todo list does not exist" });
    }
  });

  socket.on("newTodo", (listId, subject, callback) => {
    const newTodo = {
      id: uid(6),
      subject,
      createdAt: Date.now(),
      checked: false,
    };
    if (!lists[listId]) {
      callback({ success: true, err: "Invalid list ID" });
    }
    if (!todos[listId]) {
      todos[listId] = {};
    }
    todos[listId][newTodo.id] = newTodo;
    console.log("new todo", listId, newTodo);
    io.to(listId).emit("todo", listId, newTodo);
    callback({ success: true });
  });

  socket.on("updateTodo", (listId, todo, callback) => {
    // if (isValidTodo(todo)) {
    todos[listId][todo.id] = todo;
    io.to(listId).emit("todo", listId, todo);
    callback({ success: true });
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
