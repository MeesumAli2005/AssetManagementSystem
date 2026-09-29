// Pulls the backend's { message: "..." } out of a failed axios call. `err`
// in a catch block is `unknown` under strict mode, so this is the one place
// that reaches into its shape instead of every call site doing its own cast.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "message" in err.response.data &&
    typeof err.response.data.message === "string"
  ) {
    return err.response.data.message;
  }
  return fallback;
}
