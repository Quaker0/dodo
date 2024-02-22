import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Todo } from "types/todo-types";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../types/socket-types";
import TodoPanel from "./TodoPanel";
import { listTodos } from "./lib/api";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "ws://localhost:8080",
  { transports: ["websocket", "polling", "flashsocket"] }
);

socket.on("disconnect", (reason, desc) => {
  console.error("disconnect:", reason, desc);
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
});

socket.on("connect_error", (err) => {
  console.error("connect_error", err);
});

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    listTodos().then((newTodos) => {
      console.log("newTodos", newTodos);
      setTodos(newTodos);
    });

    socket.on("newTodo", (todo) => {
      console.log("received new todo:", todo);
      setTodos((prevTodos) => [...prevTodos, todo]);
    });
    return () => {
      socket.off("newTodo");
    };
  }, []);

  return <TodoPanel todos={todos} />;
}
