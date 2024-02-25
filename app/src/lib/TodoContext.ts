import { createContext } from "react";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "types/socket-types";
import { Todo, TodoList } from "types/todo-types";

const TodoContext = createContext<{
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;
  todoLists: Record<string, TodoList>;
  todos: Record<string, Record<string, Todo>>;
}>({
  socket: undefined,
  todoLists: {},
  todos: {},
});
export default TodoContext;
