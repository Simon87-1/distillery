import { ReactNode } from "react";

export type ConnectionStatus = "connecting" | "open" | "error" | "closed";

export interface ProviderProps {
  children: ReactNode;
}

export interface TransformedReport {
  id: number;
  category: string;
  date_time: string;
  performer: string;
  rel_date: number;
  url: string | undefined;
  data: string | undefined;
  content_type: string | undefined;
}

export interface MessageRow {
  id: number;
  category: string;
  date: string;
  performer: string;
  data: string | undefined;
  content_type: string | undefined;
}

export interface SourceDocuments {
  [key: number]: MessageRow;
}

export type Feedback = "like" | "dislike" | null;

export interface FeedbackOptions {
  id: string;
  label: string;
  type?: string;
}
