import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "types/socket-types";
import { Todo } from "types/todo-types";
import cors from "cors";

const port = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, SocketData>(
  server,
  { cors: { origin: "http://localhost" } }
);

const todos: Todo[] = [];

app.get("/todos", (req, res) => {
  console.log("todos", todos);
  res.send(todos);
});

app.post("/todos/add", (req, res) => {
  if (!req.body.subject) {
    res.sendStatus(400);
    res.send("Missing subject");
    return;
  }
  const newTodo = { subject: req.body.subject, createdAt: Date.now() };
  io.emit("newTodo", newTodo);
  console.log("add todo:", newTodo);
  todos.push(newTodo);
  res.sendStatus(201);
});

io.on("connection", (socket) => {
  // socket.data.name = "john";
  // socket.data.age = 42;

  // receive
  socket.on("hello", (arg) => {
    console.log("hello arg", arg);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
