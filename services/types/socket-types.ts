import { TodoTask, TodoList } from "./todo-types";

export interface ServerToClientEvents {
  task: (listId: string, t: TodoTask) => void;
  tasks: (t: Record<string, Record<string, TodoTask>>) => void;
  session: (s: SocketData) => void;
  lists: (l: TodoList[]) => void;
  list: (l: TodoList) => void;
}

export interface ClientToServerEvents {
  createTask: (
    listId: string,
    subject: string,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) => void;
  updateTask: (
    listId: string,
    task: TodoTask,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) => void;
  moveTask: (
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
