import { Socket } from "socket.io";
import { InMemorySessionStore } from "./sessionStore";
import { TodoList } from "types/todo-types";

export function getTodoLists(
  rooms: Set<string>,
  lists: Record<string, TodoList>
) {
  return [...(rooms || [])].map((listId) => lists[listId]).filter(Boolean);
}

export function updateSocketRooms(socket: Socket, rooms: Set<string>) {
  [...rooms].forEach((room) => socket.join(room));
}

export function addListListeners(
  socket: Socket,
  sessionStore: InMemorySessionStore,
  ...rooms: string[]
) {
  sessionStore.addRoom(socket.data.sessionId, ...rooms);
  updateSocketRooms(
    socket,
    sessionStore.findSession(socket.data.sessionId).rooms
  );
}
