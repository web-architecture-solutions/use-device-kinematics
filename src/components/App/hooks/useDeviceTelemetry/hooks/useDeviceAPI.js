import { useState, useEffect, useCallback } from 'react'

import useDebouncedCallback from './useDebouncedCallback'

import useErrorHandling from './useErrorHandling'

export default function useDeviceAPI({
  isFeaturePresent,
  featureDetectionError: { type, message } = {},
  listener,
  handler,
  options: { debounce = 0, enableHighAccuracy, timeout, maximumAge } = {},
  requestPermission = null
}) {
  const [data, setData] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isListening, setIsListening] = useState(null)

  const errors = useErrorHandling()

  const cachedListener = useCallback(listener(setData), [])

  const startListening = requestPermission
    ? useCallback(async () => {
        if (typeof requestPermission === 'function') {
          try {
            const permission = await requestPermission()
            if (permission === 'granted') {
              setPermissionGranted(true)
            } else {
              errors.add('devicemotion', 'User denied permission to access API')
            }
          } catch ({ message }) {
            errors.add('devicemotion', message)
          }
        } else {
          setPermissionGranted(true)
        }
      }, [requestPermission, errors])
    : null

  useEffect(() => {
    if (!isFeaturePresent) {
      errors.add(type, message)
      return null
    }
    if (permissionGranted) {
      const debouncedListener = debounce > 0 ? useDebouncedCallback(cachedListener, debounce) : cachedListener
      const cleanup = handler(debouncedListener, errors, setIsListening)
      return cleanup && typeof cleanup === 'function' ? () => cleanup() : null
    }
  }, [listener, handler, cachedListener, debounce, errors, permissionGranted, enableHighAccuracy, timeout, maximumAge])

  return { data, errors, startListening, permissionGranted, isListening }
}
