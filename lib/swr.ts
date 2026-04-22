import type { SWRConfiguration } from "swr";

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  fetcher: (url: string) => fetch(url).then((res) => res.json()),
};

export async function fetcherWithMethod<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE" = "POST",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "An error occurred");
  }

  return res.json();
}
