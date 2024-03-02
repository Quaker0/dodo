import { TodoTask, TodoList } from "./todo-types";

export interface ServerToClientEvents {
  todo: (listId: string, t: TodoTask) => void;
  todos: (t: Record<string, Record<string, TodoTask>>) => void;
  session: (s: SocketData) => void;
  todoLists: (l: TodoList[]) => void;
  list: (l: TodoList) => void;
}

export interface ClientToServerEvents {
  newTodo: (
    listId: string,
    subject: string,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) => void;
  updateTodo: (
    listId: string,
    todo: TodoTask,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) => void;
  moveTodo: (
    listId: string,
    todoId: string,
    toParentId: string,
    toOrderIdx: number,
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
