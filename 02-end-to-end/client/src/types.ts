export interface SessionMetadata {
  sessionId: string;
  language: string;
  updatedAt: string;
}

export interface CodeUpdate {
  code: string;
}

export interface LanguageUpdate {
  language: string;
}

export interface SessionState {
  code: string;
  language: string;
}
