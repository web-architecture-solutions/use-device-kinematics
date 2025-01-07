import { useState, useEffect, useCallback } from 'react'

import useDebouncedCallback from './useDebouncedCallback'

import useErrorHandling from './useErrorHandling'

import useEvent from './useEvent'

export default function useDeviceAPI({
  listenerType,
  isFeaturePresent,
  featureDetectionError,
  listener: _listener,
  handler,
  debounce = 0,
  requestPermission,
  useEvent: _useEvent = false
}) {
  const [data, setData] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const errors = useErrorHandling()

  const listener = (event) => setData(_listener(event))
  const stabilizedListener = _useEvent ? useEvent(listener) : listener

  const startListening = useCallback(async () => {
    if (typeof requestPermission === 'function') {
      try {
        const permission = await requestPermission()
        permission === 'granted' ? setPermissionGranted(true) : errors.add(listenerType, 'User denied permission to access the API.')
      } catch ({ message }) {
        errors.add(listenerType, message)
      }
    } else if (isFeaturePresent) {
      throw new Error('requestPermission must be a function')
    }
  }, [isFeaturePresent, requestPermission, errors, listenerType])

  useEffect(() => {
    if (!isFeaturePresent) {
      errors.add(listenerType, featureDetectionError)
      return
    }
    if (!permissionGranted) return
    const debouncedListener = debounce > 0 ? useDebouncedCallback(stabilizedListener, debounce) : stabilizedListener
    const cleanup = handler(debouncedListener, setIsListening, errors)
    return cleanup && typeof cleanup === 'function' ? cleanup : () => null
  }, [stabilizedListener, handler, isFeaturePresent, permissionGranted, debounce, setIsListening])

  return { data, errors, startListening, isListening }
}
