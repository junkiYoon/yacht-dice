type AxiosLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

/**
 * Extracts a user-facing error message from an Axios error (or any unknown throw).
 * Falls back to `fallback` if the response contains no message.
 */
export function extractApiError(e: unknown, fallback: string): string {
  return (e as AxiosLike)?.response?.data?.message ?? fallback;
}
