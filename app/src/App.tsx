import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "types/socket-types";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TodoPage from "./pages/TodoPage";
import ListPage from "./pages/ListPage";
import logo from "/dodo2.png";
import TodoContext from "./lib/TodoContext";
import { useEffect, useState } from "react";
import { Todo, TodoList } from "types/todo-types";
import { Dictionary, keyBy } from "lodash";
import { listAllTodos } from "./lib/api";

const SESSION_ID_KEY = "dodo-session-id";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "ws://localhost:8080",
  {
    withCredentials: true,
    auth: { sessionId: localStorage.getItem(SESSION_ID_KEY) },
    transports: ["websocket", "polling", "flashsocket"],
  }
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
  const [todoLists, setTodoLists] = useState<Dictionary<TodoList>>({});
  const [todos, setTodos] = useState<Dictionary<Dictionary<Todo>>>({});

  useEffect(() => {
    listAllTodos().then((allTodos) => setTodos(allTodos));

    socket.on("connect", () => {
      const sessionId = localStorage.getItem(SESSION_ID_KEY);
      if (!sessionId) {
        socket.on("session", ({ sessionId }) => {
          socket.auth = { sessionId };
          localStorage.setItem(SESSION_ID_KEY, sessionId);
        });
      }
    });

    socket.on("todoLists", (newTodoLists) => {
      console.log(
        "newTodoLists",
        newTodoLists.map((l) => l.title)
      );
      setTodoLists(keyBy(newTodoLists, "id"));
    });

    socket.on("todo", (listId, todo) => {
      console.log("received todo:", todo);
      setTodos((prevTodos) => {
        const newTodoList = { ...prevTodos[listId], [todo.id]: todo };
        const newTodos = {
          ...prevTodos,
          [listId]: newTodoList,
        };
        console.log("newTodos", newTodos);
        return newTodos;
      });
    });
    return () => {
      socket.off("todoLists");
      socket.off("todo");
    };
  }, []);

  console.log("todoLists", todoLists);
  console.log("todos", todos);
  return (
    <Router>
      <TodoContext.Provider value={{ socket, todoLists, todos }}>
        <div className="pb-10">
          <header>
            <Link to="/">
              <div className="flex flex-row items-center m-3">
                <img src={logo} className="h-[4em] m-1" alt="Logo" />
                <h1>Dodo</h1>
              </div>
            </Link>
          </header>
          <nav></nav>

          <Routes>
            <Route path=":listId" element={<TodoPage />} />
            <Route path="/" element={<ListPage />} />
          </Routes>
        </div>
      </TodoContext.Provider>
    </Router>
  );
}
