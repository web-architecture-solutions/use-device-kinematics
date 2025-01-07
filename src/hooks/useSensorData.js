import { useCallback, useMemo, useEffect, useState, useRef } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import useCurvature from './useCurvature'
import useTotalAngularVelocity from './useTotalAngularVelocity'
import useTotalAccleration from './useTotalAcceleration'

import { calculateVelocity } from '../lib/physics'

function transformSensorData(
  motionData,
  orientationData,
  geolocationData,
  timestamp,
  points,
  curvature,
  totalAngularVelocity,
  velocity,
  totalAcceleration,
  accelerationSamples,
  velocity2
) {
  const data = {
    linearAcceleration: motionData?.acceleration,
    linearAccelerationIncludingGravity: motionData?.accelerationIncludingGravity,
    angularVelocity: motionData?.rotationRate,
    motionInterval: motionData?.interval,
    geolocationTimestamp: geolocationData?.timestamp,
    timestamp
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
    velocity,
    totalAcceleration,
    accelerationSamples,
    velocity2
  }

  return data
}

function useClock(updateFrequency = 10) {
  const startTime = useRef(null)
  const [globalTimestamp, setGlobalTimestamp] = useState(0)

  useEffect(() => {
    startTime.current = performance.now()

    const intervalId = setInterval(() => {
      setGlobalTimestamp(performance.now() - startTime.current)
    }, updateFrequency)

    return () => clearInterval(intervalId)
  }, [])

  return globalTimestamp
}

function integrateAccelerationTrapezoidal(data) {
  if (data.length < 2) {
    return { velocity: 0, displacement: 0 }
  }

  let velocity = 0
  let displacement = 0

  for (let i = 1; i < data.length; i++) {
    const dt = data[i]?.timestamp - data[i - 1]?.timestamp
    const dv = 0.5 * (data[i]?.acceleration + data[i - 1]?.acceleration) * dt
    const dd = 0.5 * (velocity + velocity + dv) * dt
    velocity += dv
    displacement += dd
  }

  return { velocity, displacement }
}

function integrateAccelerationSimpson(data) {
  if (data.length < 3) {
    return integrateAccelerationTrapezoidal(data)
  }

  let velocity = 0
  let displacement = 0

  for (let i = 2; i < data.length; i++) {
    const dt1 = data[i - 1]?.timestamp - data[i - 2]?.timestamp
    const dt2 = data[i]?.timestamp - data[i - 1]?.timestamp

    if (Math.abs(dt1 - dt2) > 1e-6) {
      return integrateAccelerationTrapezoidal(data)
    }
    const dt = (dt1 + dt2) / 2
    const dv = (dt / 3) * (data[i]?.acceleration + 4 * data[i - 1]?.acceleration + data[i - 2]?.acceleration)
    const dd = (dt / 3) * (velocity + 4 * (velocity + dv) + velocity)
    velocity += dv
    displacement += dd
  }

  return { velocity, displacement }
}

export default function useSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const [velocity, setVelocity] = useState(null)

  const { curvature, points } = useCurvature({ latitude: geolocation.data?.latitude, longitude: geolocation.data?.longitude })

  const totalAngularVelocity = useTotalAngularVelocity({
    alpha: motion.data?.rotationRate.alpha,
    beta: motion.data?.rotationRate.beta,
    gamma: motion.data?.rotationRate.gamma
  })

  const totalAcceleration = useTotalAccleration({
    x: motion.data?.acceleration.x,
    y: motion.data?.acceleration.y,
    z: motion.data?.acceleration.z
  })

  useEffect(() => {
    const _velocity = curvature ? calculateVelocity(totalAngularVelocity, curvature) : null
    setVelocity(_velocity)
  }, [totalAngularVelocity, curvature])

  const timestamp = useClock()

  const [accelerationSamples, setAccelerationSamples] = useState(Array.from({ length: 10 }, () => null))

  const { velocity: velocity2 } = integrateAccelerationSimpson(accelerationSamples)

  useEffect(() => {
    if (totalAcceleration) {
      setAccelerationSamples((oldAccelerationSamples) => [
        ...oldAccelerationSamples.slice(1),
        { acceleration: totalAcceleration, timestamp }
      ])
    }
  }, [totalAcceleration])

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
    data: transformSensorData(
      motion.data,
      orientation.data,
      geolocation.data,
      timestamp,
      points,
      curvature,
      totalAngularVelocity,
      velocity,
      totalAcceleration,
      accelerationSamples,
      velocity2
    ),
    errors,
    isListening,
    startListening
  }
}
