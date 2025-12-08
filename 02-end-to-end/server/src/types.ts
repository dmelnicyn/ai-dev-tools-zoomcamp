export interface Session {
  sessionId: string;
  code: string;
  language: string;
  updatedAt: Date;
}

export interface SessionMetadata {
  sessionId: string;
  language: string;
  updatedAt: Date;
}
