// Low-level helpers. Every request goes to /api (Vite proxies it to FastAPI).

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

export const postForm = (path, form) => handle(fetch(`/api${path}`, { method: 'POST', body: form }))

export const postJson = (path, body) =>
  handle(
    fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  )

export const getJson = (path) => handle(fetch(`/api${path}`))
