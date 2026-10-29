import { useCallback, useState } from 'react'

// Wraps an API call and tracks loading / error / data for you.
export default function useAnalysis(apiFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(
    async (...args) => {
      setLoading(true)
      setError('')
      setData(null)
      try {
        const result = await apiFn(...args)
        setData(result)
        return result
      } catch (err) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiFn]
  )

  return { data, loading, error, run }
}
