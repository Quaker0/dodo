import { createContext } from "react";
import { TodoTask, TodoList } from "types/todo-types";
import SocketWrapper from "./socket";

const TodoContext = createContext<{
  socket: SocketWrapper | undefined;
  todoLists: Record<string, TodoList>;
  todos: Record<string, Record<string, TodoTask>>;
}>({
  socket: undefined,
  todoLists: {},
  todos: {},
});
export default TodoContext;
