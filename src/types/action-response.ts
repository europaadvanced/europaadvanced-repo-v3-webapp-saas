export type ActionError = {
  message: string;
};

export type ActionResponse<Data = void> = {
  data?: Data;
  error: ActionError | null;
};
