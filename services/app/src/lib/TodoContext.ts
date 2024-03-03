import { createContext } from "react";
import { TodoTask, TodoList } from "types/todo-types";
import SocketWrapper from "./socket";

const TodoContext = createContext<{
  socket: SocketWrapper | undefined;
  lists: Record<string, TodoList>;
  tasks: Record<string, Record<string, TodoTask>>;
}>({
  socket: undefined,
  lists: {},
  tasks: {},
});
export default TodoContext;
