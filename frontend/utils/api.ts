export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type JsonValue = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

type PostJsonOptions = {
  signal?: AbortSignal;
  onBeforeParse?: () => void;
};

export async function postJSON<T>(
  path: string,
  body: JsonValue,
  options: PostJsonOptions = {},
): Promise<T> {
  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  };

  if (options.signal) {
    requestInit.signal = options.signal;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, requestInit);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    if (error instanceof Error) {
      throw new Error(
        error.message && error.message !== 'Failed to fetch'
          ? error.message
          : 'Unable to reach the server. Please check your connection and try again.'
      );
    }

    throw error;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (options.onBeforeParse) {
    options.onBeforeParse();
  }

  return response.json() as Promise<T>;
}
