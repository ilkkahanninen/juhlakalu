import { ErrorMessage } from "../rust-types/ErrorMessage";

export type AsyncState = {
  error?: ErrorMessage;
  isLoading: boolean;
};

export const initialAsyncState: AsyncState = {
  error: undefined,
  isLoading: false,
};

export const startedAsyncState: AsyncState = {
  error: undefined,
  isLoading: true,
};
