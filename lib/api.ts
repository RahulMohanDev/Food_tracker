export function createAuthHeaders(userId: string | null): HeadersInit {
  if (!userId) {
    throw new Error('User not selected')
  }
  return {
    'x-user-id': userId,
  }
}

export async function fetchWithAuth(url: string, userId: string | null, options?: RequestInit) {
  if (!userId) {
    throw new Error('Please select a user first')
  }

  const headers: HeadersInit = {
    ...createAuthHeaders(userId),
  }

  // Only add Content-Type if there's a body
  if (options?.body) {
    headers['Content-Type'] = 'application/json'
  }

  if (options?.headers) {
    Object.assign(headers, options.headers)
  }

  return fetch(url, { ...options, headers })
}
