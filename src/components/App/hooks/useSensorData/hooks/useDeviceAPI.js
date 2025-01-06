import { useState, useEffect, useCallback } from 'react'

import useDebouncedCallback from './useDebouncedCallback'

import useErrorHandling from './useErrorHandling'

export default function useDeviceAPI({
  isFeaturePresent,
  featureDetectionError: { type, message } = {},
  listenerFactory,
  handler,
  options: { debounce = 0, enableHighAccuracy, timeout, maximumAge } = {},
  requestPermission = null,
  thunkCleanup = false
}) {
  const [data, setData] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(requestPermission ? false : true)
  const [isListening, setIsListening] = useState(null)

  const errors = useErrorHandling()

  const cachedListener = useCallback(listenerFactory(setData), [])

  const startListening = requestPermission
    ? useCallback(async () => {
        if (typeof requestPermission === 'function') {
          try {
            const permission = await requestPermission()
            if (permission === 'granted') {
              setPermissionGranted(true)
            } else {
              errors.add('devicemotion', 'User denied permission to access the API.')
            }
          } catch ({ message }) {
            errors.add('devicemotion', message)
          }
        } else {
          throw new Error('requestPermission must be a function')
        }
      }, [requestPermission, errors])
    : null

  useEffect(() => {
    if (!isFeaturePresent) {
      errors.add(type, message)
      return
    }
    if (permissionGranted) {
      const debouncedListener = debounce > 0 ? useDebouncedCallback(cachedListener, debounce) : cachedListener
      const cleanup = handler(debouncedListener, setIsListening, errors)
      if (cleanup && typeof cleanup === 'function') {
        return thunkCleanup ? () => cleanup : cleanup
      }
      return () => null
    }
  }, [listenerFactory, handler, cachedListener, debounce, errors, permissionGranted, enableHighAccuracy, timeout, maximumAge])

  return { data, errors, startListening, isListening }
}
