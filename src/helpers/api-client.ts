import "whatwg-fetch";

const host = import.meta.env.VITE_API_HOST;

export function getHeaders() {
  return {
    "content-type": "application/json",
    "x-api-key": `${import.meta.env.VITE_API_KEY}`,
    "x-access-token": `${import.meta.env.VITE_API_TOKEN}`,
  };
}

const fetcher = (url: string, options?: RequestInit) =>
  window
    .fetch(url, {
      headers: options?.headers || {
        // Accept: "application/json",
        "Content-Type": "application/json",
      },
      // credentials: "include",
      method: options?.method || "GET",
      ...options,
    })
    .then((r) => {
      if (r?.headers?.get("content-type")?.match("json")) {
        return r?.json();
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

const qualifySvcUrl = `${host}/membership/qualify`;
const joinSvcUrl = `${host}/membership/join`;

export { fetcher, qualifySvcUrl, joinSvcUrl };
