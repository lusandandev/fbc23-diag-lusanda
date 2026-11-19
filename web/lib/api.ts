const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ApiErrorPayload = {
  success?: boolean;
  error?: string;
  fields?: Record<string, string>;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiClientError('Network error connecting to the API.', 0);
  }

  if (response.status === 204) return undefined as T;

  let payload: ApiErrorPayload & Record<string, unknown>;
  try {
    payload = await response.json() as ApiErrorPayload & Record<string, unknown>;
  } catch {
    throw new ApiClientError('The API returned an unreadable response.', response.status);
  }

  if (!response.ok || payload.success === false) {
    throw new ApiClientError(
      payload.error || 'The request failed.',
      response.status,
      payload.fields || {},
    );
  }

  return payload as T;
};
