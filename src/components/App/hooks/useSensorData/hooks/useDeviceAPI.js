import { useState, useEffect, useCallback, useRef } from 'react'

import useDebouncedCallback from './useDebouncedCallback'

import useErrorHandling from './useErrorHandling'

export default function useDeviceAPI({
  isFeaturePresent,
  featureDetectionError: { type, message } = {},
  listenerFactory,
  handlerFactory,
  options = {},
  requestPermission = null
}) {
  const { debounce = 0, enableHighAccuracy, timeout, maximumAge } = options

  const [data, setData] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(requestPermission ? false : true)
  const [isListening, setIsListening] = useState(null)

  const errors = useErrorHandling()

  const listener = listenerFactory(setData)

  const startListening = requestPermission
    ? useCallback(async () => {
        if (typeof requestPermission === 'function') {
          try {
            const permission = await requestPermission()
            permission === 'granted' ? setPermissionGranted(true) : errors.add(type, 'User denied permission to access the API.')
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
    if (!permissionGranted) return

    const debouncedListener = debounce > 0 ? useDebouncedCallback(listener, debounce) : listener
    const handler = handlerFactory(options)
    const cleanup = handler(debouncedListener, setIsListening, errors)
    return cleanup && typeof cleanup === 'function' ? cleanup : () => null
  }, [listenerFactory, handlerFactory, listener, debounce, errors, permissionGranted, enableHighAccuracy, timeout, maximumAge])

  return { data, errors, startListening, isListening }
}
