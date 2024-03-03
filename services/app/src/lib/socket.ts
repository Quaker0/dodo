import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "types/socket-types";
import { TodoTask, TodoList } from "types/todo-types";

const SESSION_ID_KEY = "dodo-session-id";

export default class SocketWrapper {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    this.socket = io(`${process.env.SERVER_URL}`, {
      withCredentials: true,
      auth: { sessionId: localStorage.getItem(SESSION_ID_KEY) },
      transports: ["websocket", "polling"],
    });

    this.socket.on("disconnect", (reason, desc) => {
      console.error("disconnect:", reason, desc);
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, need to reconnect manually
        this.socket.connect();
      }
      // else the socket will automatically try to reconnect
    });

    this.socket.on("connect_error", (err) => {
      console.error("connect_error", err);
    });

    this.socket.on("connect", () => {
      const sessionId = localStorage.getItem(SESSION_ID_KEY);
      if (!sessionId) {
        this.socket.on("session", ({ sessionId }) => {
          this.socket.auth = { sessionId };
          localStorage.setItem(SESSION_ID_KEY, sessionId);
        });
      }
    });
  }

  onTodoLists(callback: (l: TodoList[]) => void) {
    this.socket.on("lists", (newTodoLists) => {
      callback(newTodoLists);
    });
  }

  onList(callback: (list: TodoList) => void) {
    this.socket.on("list", (list) => {
      callback(list);
    });
  }

  onTask(callback: (listId: string, todo: TodoTask) => void) {
    this.socket.on("task", (listId, task) => {
      callback(listId, task);
    });
  }

  onTasks(callback: (todos: Record<string, Record<string, TodoTask>>) => void) {
    this.socket.on("tasks", (tasks) => {
      callback(tasks);
    });
  }

  sendNewList(
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
  ) {
    this.socket
      ?.timeout(2_000)
      .emitWithAck("createTodoList", title)
      .then(callback)
      .catch((ex) => callback({ success: false, err: ex.message }));
  }

  joinList(
    listId: string,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) {
    this.socket
      ?.timeout(2_000)
      .emitWithAck("joinList", listId)
      .then(callback)
      .catch((ex) => callback({ success: false, err: ex.message }));
  }

  sendNewTodo(
    listId: string,
    subject: string,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) {
    this.socket
      .timeout(2_000)
      .emitWithAck("createTask", listId, subject)
      .then(callback)
      .catch((ex) => callback({ success: false, err: ex.message }));
  }

  sendUpdatedTodo(
    listId: string,
    todo: TodoTask,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) {
    this.socket
      .timeout(2_000)
      .emitWithAck("updateTask", listId, todo)
      .then(callback)
      .catch((ex) => callback({ success: false, err: ex.message }));
  }

  sendMoveTask(
    listId: string,
    todoId: string,
    toParentId: string,
    toOrderIdx: number,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) {
    this.socket
      .timeout(2_000)
      .emitWithAck("moveTask", listId, todoId, toParentId, toOrderIdx)
      .then(callback)
      .catch((ex) => callback({ success: false, err: ex.message }));
  }

  offLoadAllListeners() {
    this.socket.offAny();
  }
}
