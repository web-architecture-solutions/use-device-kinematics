import { useCallback, useEffect, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import usePrevious from './usePrevious'
import useClock from './useClock'

//import useHeading from './useHeading'

import DeviceKinematics from '../lib/DeviceKinematics'

export default function useSensorData(config = {}) {
  // TODO: Start clock once data's loaded
  const [timestamp, previousTimestamp] = useClock()

  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  //const heading = useHeading(orientation.data?.alpha)

  const { current, previous, update } = usePrevious({
    position: {
      x: null,
      y: null,
      z: null
    },
    acceleration: { x: null, y: null, z: null },
    orientation: {
      yaw: null,
      pitch: null,
      roll: null
    },
    angularVelocity: { alpha: null, beta: null, gamma: null }
  })

  useEffect(() => {
    update({
      position: {
        x: geolocation.data?.longitude,
        y: geolocation.data?.latitude,
        z: geolocation.data?.altitude
      },
      acceleration: { ...motion.data?.acceleration },
      orientation: {
        yaw: orientation.data?.alpha,
        pitch: orientation.data?.beta,
        roll: orientation.data?.gamma
      },
      angularVelocity: { ...motion.data?.rotationRate }
    })
  }, [motion.data, orientation.data, geolocation.data])

  const derivedData = useMemo(() => {
    return new DeviceKinematics(
      {
        position: {
          ...current.position,
          previous: previous.position
        },
        acceleration: {
          ...current.acceleration,
          previous: previous.acceleration
        },
        angularVelocity: {
          ...current.angularVelocity,
          previous: previous.angularVelocity
        },
        orientation: {
          ...current.orientation,
          previous: previous.orientation
        }
      },
      timestamp - previousTimestamp
    ).derivedData
  }, [motion.data, orientation.data, geolocation.data])

  const errors = useMemo(
    () => ({ ...motion.errors, ...orientation.errors, ...geolocation.errors }),
    [motion.errors, orientation.errors, geolocation.errors]
  )

  const isListening = useMemo(
    () => motion.isListening || orientation.isListening || geolocation.isListening,
    [motion.isListening, orientation.isListening, geolocation.isListening]
  )

  const startListening = useCallback(async () => {
    await Promise.all([motion.startListening(), orientation.startListening(), geolocation.startListening()])
  }, [motion.startListening, orientation.startListening, geolocation.startListening])

  return {
    data: { ...current, ...derivedData },
    errors,
    isListening,
    startListening
  }
}
