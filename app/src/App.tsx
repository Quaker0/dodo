import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TodoPage from "./pages/TodoPage";
import ListPage from "./pages/ListPage";
import logo from "/chirp.svg";
import TodoContext from "./lib/TodoContext";
import { useEffect, useState } from "react";
import { Todo, TodoList } from "types/todo-types";
import { Dictionary, keyBy } from "lodash";
import { listAllTodos } from "./lib/api";
import SocketWrapper from "./lib/socket";

export default function App() {
  const [todoLists, setTodoLists] = useState<Dictionary<TodoList>>({});
  const [todos, setTodos] = useState<Dictionary<Dictionary<Todo>>>({});
  const socket = new SocketWrapper();

  useEffect(() => {
    listAllTodos().then((allTodos) => setTodos(allTodos));
    socket.onTodoLists((newLists) => setTodoLists(keyBy(newLists, "id")));

    socket.onTodo((listId, todo) => {
      setTodos((prevTodos) => {
        const newTodoList = { ...prevTodos[listId], [todo.id]: todo };
        const newTodos = {
          ...prevTodos,
          [listId]: newTodoList,
        };
        return newTodos;
      });
    });

    return () => {
      socket.offLoadAllListeners();
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
