import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "types/socket-types";
import { Todo, TodoList } from "types/todo-types";

const SESSION_ID_KEY = "dodo-session-id";

export default class SocketWrapper {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  constructor() {
    this.socket = io("ws://localhost:3000", {
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
    this.socket.on("todoLists", (newTodoLists) => {
      console.log(
        "newTodoLists",
        newTodoLists.map((l) => l.title)
      );
      callback(newTodoLists);
    });
  }

  onTodo(callback: (listId: string, todo: Todo) => void) {
    this.socket.on("todo", (listId, todo) => {
      callback(listId, todo);
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
      ?.timeout(1000)
      .emitWithAck("createTodoList", title)
      .then(callback)
      .catch((ex) => callback({ success: false, err: ex.message }));
  }

  joinList(
    listId: string,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) {
    this.socket?.timeout(1000).emitWithAck("joinList", listId).then(callback);
  }

  sendNewTodo(
    listId: string,
    subject: string,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) {
    this.socket
      .timeout(1000)
      .emitWithAck("newTodo", listId, subject)
      .then(callback);
  }

  sendUpdatedTodo(
    listId: string,
    todo: Todo,
    callback: ({ success, err }: { success: boolean; err?: string }) => void
  ) {
    this.socket
      .timeout(1000)
      .emitWithAck("updateTodo", listId, todo)
      .then(callback);
  }

  offLoadAllListeners() {
    this.socket.offAny();
  }
}
