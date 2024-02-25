import { Todo, TodoList } from "./todo-types";

export interface ServerToClientEvents {
  todo: (listId: string, t: Todo) => void;
  session: (s: SocketData) => void;
  todoLists: (l: TodoList[]) => void;
}

export interface ClientToServerEvents {
  newTodo: (
    listId: string,
    subject: string,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) => void;
  updateTodo: (
    listId: string,
    todo: Todo,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) => void;
  joinList: (
    listId: string,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) => void;
  createTodoList: (
    title: string,
    callback: ({
      success,
      err,
      id,
    }: {
      success: boolean;
      err?: string;
      id?: string;
    }) => void
  ) => void;
  getLists: (
    callback: ({
      success,
      lists,
    }: {
      success: boolean;
      lists: TodoList[];
    }) => void
  ) => void;
}

export interface SocketData {
  sessionId: string;
  rooms?: Set<string>;
}
