import { useState, useEffect } from 'react'

import useClock from './useClock'

import { toRadians } from '../../../lib/math'

import SensorData from '../lib/SensorData'
import useRawSensorData from '../../use-raw-sensor-data'

export default function useSensorData(config = {}) {
  const [sensorData, setSensorData] = useState(SensorData.initial)
  const [startClock, setStartClock] = useState(false)

  const { timestamp } = useClock(4, startClock)
  const { refreshRates, rawSensorData, errors, isListening, startListening } = useRawSensorData(config)

  useEffect(() => {
    if (isListening) {
      if (!startClock) setStartClock(true)
      setSensorData(
        (previousSensorData) =>
          new SensorData(
            {
              position: {
                x: rawSensorData.longitude,
                y: rawSensorData.latitude,
                z: rawSensorData.altitude,
                timestamp: timestamp ?? null
              },
              acceleration: {
                x: rawSensorData.acceleration.x,
                y: rawSensorData.acceleration.y,
                z: rawSensorData.acceleration.z,
                timestamp: timestamp ?? null
              },
              orientation: {
                x: toRadians(rawSensorData.beta),
                y: toRadians(rawSensorData.gamma),
                z: toRadians(rawSensorData.alpha),
                timestamp: timestamp ?? null
              },
              angularVelocity: {
                x: toRadians(rawSensorData.rotationRate.beta),
                y: toRadians(rawSensorData.rotationRate.gamma),
                z: toRadians(rawSensorData.rotationRate.alpha),
                timestamp: timestamp ?? null
              }
            },
            previousSensorData,
            timestamp
          )
      )
    }
  }, [rawSensorData, timestamp])

  return {
    sensorData,
    refreshRates,
    errors,
    isListening,
    startListening
  }
}
