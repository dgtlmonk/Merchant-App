import "whatwg-fetch";

const fetcher = (url: string, options?: RequestInit) =>
  window
    .fetch(url, {
      headers: options?.headers || {
        // Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: options?.method || "GET",
      ...options,
    })
    .then((r) => {
      if (r?.headers?.get("content-type")?.match("json")) {
        return r.json();
      }
    });

// Utilities
export const client = {
  get: (url: string, options?: RequestInit) => fetcher(url, options),
  post: (url: string, options?: RequestInit) =>
    fetcher(url, { ...options, method: "POST" }),
  put: (url: string, options?: RequestInit) =>
    fetcher(url, { ...options, method: "PUT" }),
  delete: (url: string, options?: RequestInit) =>
    fetcher(url, { ...options, method: "DELETE" }),
};

export { fetcher };
