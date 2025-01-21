import { useState, useEffect, useCallback, useRef } from 'react'

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
  useEvent: _useEvent = false,
  initialData = {}
}) {
  const [data, setData] = useState(initialData)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [refreshRate, setRefreshRate] = useState(null)
  const errors = useErrorHandling()

  const lastUpdateTimeRef = useRef(null)

  const listener = useCallback(
    (event) => {
      const now = Date.now()

      if (lastUpdateTimeRef.current !== null) {
        const deltaTime = now - lastUpdateTimeRef.current
        const rate = 1000 / deltaTime
        setRefreshRate(rate)
      }

      lastUpdateTimeRef.current = now / setData(_listener(event))
    },
    [_listener]
  )

  const stabilizedListener = _useEvent ? useEvent(listener) : listener

  const startListening = useCallback(async () => {
    if (typeof requestPermission === 'function') {
      try {
        const permission = await requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
        } else {
          errors.add(listenerType, 'User denied permission to access the API.')
        }
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

  return { data, refreshRate, errors, startListening, isListening }
}
