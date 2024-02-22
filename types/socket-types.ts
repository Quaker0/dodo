import { Todo } from "./todo-types";

export interface ServerToClientEvents {
  newTodo: (a: Todo) => void;
}

export interface ClientToServerEvents {
  hello: (arg: any) => void;
}

export interface SocketData {
  name: string;
  age: number;
}
