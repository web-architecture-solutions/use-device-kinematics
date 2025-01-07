import { useCallback, useMemo, useEffect, useState } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import { calculateCurvature, calculateTotalAngularVelocity, calculateVelocity } from '../lib/physics'

function transformSensorData(motionData, orientationData, geolocationData, points, curvature, totalAngularVelocity, velocity) {
  const data = {
    linearAcceleration: motionData?.acceleration,
    linearAccelerationIncludingGravity: motionData?.accelerationIncludingGravity,
    angularVelocity: motionData?.rotationRate,
    motionInterval: motionData?.interval,
    geolocationTimestamp: geolocationData?.timestamp
  }

  if (geolocationData) {
    data.position = {
      latitude: geolocationData?.latitude,
      longitude: geolocationData?.longitude,
      altitude: geolocationData?.altitude,
      accuracy: geolocationData?.accuracy,
      altitudeAccuracy: geolocationData?.altitudeAccuracy
    }

    data.velocity = {
      heading: geolocationData?.heading,
      speed: geolocationData?.speed
    }
  }

  if (orientationData) {
    data.orientation = {
      yaw: orientationData.alpha,
      pitch: orientationData.beta,
      roll: orientationData.gamma
    }
  }

  data.debug = {
    points,
    curvature,
    totalAngularVelocity,
    velocity
  }

  return data
}

export default function useSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const [points, setPoints] = useState([null, null, null])
  const [curvature, setCurvature] = useState(null)
  const [totalAngularVelocity, setTotalAngularVelocity] = useState(null)
  const [velocity, setVelocity] = useState(null)

  useEffect(() => {
    if (geolocation.data?.latitude && geolocation.data?.longitude) {
      setPoints(([_, p, q]) => [p, q, { latitude: geolocation.data.latitude, longitude: geolocation.data.longitude }])
    }
  }, [geolocation.data?.latitude, geolocation.data?.longitude])

  useEffect(() => {
    const [p1, p2, p3] = points
    if (p1 && p2 && p3) {
      const curvature = calculateCurvature(points[0], points[1], points[2])
      setCurvature(curvature)
    }
  }, [points[0], points[1], points[2]])

  useEffect(() => {
    if (motion.data) {
      const _totalAngularVelocity = calculateTotalAngularVelocity(
        motion.data.rotationRate.alpha,
        motion.data.rotationRate.beta,
        motion.data.rotationRate.gamma
      )
      setTotalAngularVelocity(_totalAngularVelocity)
    }
  }, [motion.data?.rotationRate.alpha, motion.data?.rotationRate.beta, motion.data?.rotationRate.gamma])

  useEffect(() => {
    const _velocity = curvature ? calculateVelocity(totalAngularVelocity, curvature) : null
    setVelocity(_velocity)
  }, [totalAngularVelocity, curvature])

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
    data: transformSensorData(motion.data, orientation.data, geolocation.data, points, curvature, totalAngularVelocity, velocity),
    errors,
    isListening,
    startListening
  }
}
