import { useState, useEffect, useCallback } from 'react'

import useDebouncedCallback from './useDebouncedCallback'

import useErrorHandling from './useErrorHandling'

import useEvent from './useEvent'

export default function useDeviceAPI({
  isFeaturePresent,
  featureDetectionError: { type, message } = {},
  listenerFactory,
  handlerFactory,
  options = {},
  requestPermission,
  useEvent: _useEvent = false
}) {
  const { debounce = 0, enableHighAccuracy, timeout, maximumAge } = options

  const [data, setData] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const errors = useErrorHandling()

  const listener = _useEvent ? useEvent(listenerFactory(setData)) : listenerFactory(setData)

  const startListening = useCallback(async () => {
    if (typeof requestPermission === 'function') {
      try {
        const permission = await requestPermission()
        permission === 'granted' ? setPermissionGranted(true) : errors.add(type, 'User denied permission to access the API.')
      } catch ({ message }) {
        errors.add(type, message)
      }
    } else if (isFeaturePresent) {
      throw new Error('requestPermission must be a function')
    }
  }, [requestPermission, errors])

  console.log('FOO', isFeaturePresent)

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
