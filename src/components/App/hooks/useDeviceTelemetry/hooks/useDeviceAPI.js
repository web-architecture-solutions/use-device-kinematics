import { useState, useEffect, useCallback } from 'react'

export default function useDeviceAPI({
  update: _update,
  isFeaturePresent,
  featureDetectionError: { type, message } = {},
  options: { debounce = 0, enableHighAccuracy, timeout, maximumAge } = {},
  callback
}) {
  const [data, setData] = useState(null)
  const errors = useErrorHandling()
  const update = useCallback(_update(setData), [])
  const debouncedUpdate = useDebouncedCallback(update, debounce)
  useEffect(() => {
    if (!isFeaturePresent) {
      errors.add(type, message)
      return
    }
    const handleDeviceEvent = debounce > 0 ? debouncedUpdate : update
    const cleanup = callback(handleDeviceEvent, errors)
    return () => (cleanup ? cleanup() : null)
  }, [debouncedUpdate, update, debounce, errors, enableHighAccuracy, timeout, maximumAge])
  return { data, errors }
}
