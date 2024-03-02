import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TodoPage from "./pages/TodoPage";
import ListPage from "./pages/ListPage";
import logo from "/chirp.svg";
import TodoContext from "./lib/TodoContext";
import { useEffect, useState } from "react";
import { TodoTask, TodoList } from "types/todo-types";
import { Dictionary, keyBy } from "lodash";
import SocketWrapper from "./lib/socket";

const socket = new SocketWrapper();

export default function App() {
  const [todoLists, setTodoLists] = useState<Dictionary<TodoList>>({});
  const [todos, setTodos] = useState<Dictionary<Dictionary<TodoTask>>>({});

  useEffect(() => {
    socket.onTodos((todos) => {
      setTodos(todos);
    });
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

    socket.onTodoLists((newLists) => {
      setTodoLists(keyBy(newLists, "id"));
    });
    socket.onList((list) => {
      setTodoLists((todoLists) => ({ ...todoLists, [list.id]: list }));
    });

    return () => {
      socket.offLoadAllListeners();
    };
  }, []);

  return (
    <Router>
      <TodoContext.Provider value={{ socket, todoLists, todos }}>
        <div className="pb-10">
          <header className="flex flex-row items-center justify-center w-full">
            <Link to="/">
              <div className="flex flex-row items-center m-3">
                <img src={logo} className="h-[20em]" alt="Dodo" />
              </div>
            </Link>
          </header>

          <Routes>
            <Route path=":listId" element={<TodoPage />} />
            <Route path="/" element={<ListPage />} />
          </Routes>
        </div>
      </TodoContext.Provider>
    </Router>
  );
}
