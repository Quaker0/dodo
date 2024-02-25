import { SocketData } from "types/socket-types";

type SessionData = Partial<SocketData>;

export class InMemorySessionStore {
  private sessions: Map<string, SessionData>;
  constructor() {
    this.sessions = new Map();
  }

  findSession(id: string) {
    return this.sessions.get(id);
  }

  createSessionIfNotExists(id: string, session: SessionData) {
    if (!this.findSession(id)) {
      this.sessions.set(id, session);
    }
  }

  addRoom(id: string, room: string) {
    const session = this.sessions.get(id) || { sessionId: id };
    session.rooms = new Set([...(session?.rooms || []), room]);
    this.sessions.set(id, session);
  }
}
