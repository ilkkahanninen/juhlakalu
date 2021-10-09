import { ErrorCode } from "./ErrorCode";

export interface ErrorMessage {
  status_code: number;
  error: ErrorCode;
  message: string;
  info: string | null;
}