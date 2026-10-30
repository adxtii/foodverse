// Low-level helpers.
// Locally, requests go to /api and Vite forwards them to FastAPI.
// On the live site, set VITE_API_URL (e.g. https://foodverse-api.onrender.com) so they go to your backend.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function handle(responsePromise) {
  let res
  try {
    res = await responsePromise
  } catch {
    throw new Error("Can't reach the server. Is the backend running on port 8000?")
  }

  if (!res.ok) {
    let message = `Something went wrong (${res.status}).`
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') message = body.detail
      else if (Array.isArray(body.detail)) message = 'Please check the form: ' + body.detail.map((d) => d.msg).join(', ')
    } catch {
      /* body was not JSON, keep the default message */
    }
    throw new Error(message)
  }
  return res.json()
}

export const postForm = (path, form) => handle(fetch(`${BASE}/api${path}`, { method: 'POST', body: form }))

export const postJson = (path, body) =>
  handle(
    fetch(`${BASE}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  )

export const getJson = (path) => handle(fetch(`${BASE}/api${path}`))