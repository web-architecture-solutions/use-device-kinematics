import { useState, useEffect } from 'react'

import useClock from './useClock'
import useRawSensorData from '../../use-raw-sensor-data'

import { toRadians } from '../../math'

import SensorData from '../lib/SensorData'

export default function useSensorData(config = {}) {
  const [sensorData, setSensorData] = useState(SensorData.initial)
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)

  const { timestamp, previousTimestamp } = useClock(SensorData.deltaT, sensorDataIsReady)
  const { rawSensorData, errors, isListening, startListening } = useRawSensorData(config)

  useEffect(
    (previousRawSensorData) => {
      setSensorData(
        new SensorData(
          {
            position: {
              x: rawSensorData.longitude,
              y: rawSensorData.latitude,
              z: rawSensorData.altitude
            },
            acceleration: {
              x: rawSensorData.acceleration.x,
              y: rawSensorData.acceleration.y,
              z: rawSensorData.acceleration.z
            },
            orientation: {
              x: toRadians(rawSensorData.beta),
              y: toRadians(rawSensorData.gamma),
              z: toRadians(rawSensorData.alpha)
            },
            angularVelocity: {
              x: toRadians(rawSensorData.rotationRate.beta),
              y: toRadians(rawSensorData.rotationRate.gamma),
              z: toRadians(rawSensorData.rotationRate.alpha)
            }
          },
          previousRawSensorData,
          previousRawSensorData?.derivativesWrtT ?? null,
          timestamp,
          previousTimestamp
        )
      )
    },
    [rawSensorData]
  )

  useEffect(() => {
    if (!sensorData.isReady && sensorDataIsReady) {
      throw new Error('useSensorData: Clock started before sensor data was ready')
    } else if (sensorData.isReady && !sensorDataIsReady) {
      setSensorDataIsReady(sensorData.isReady)
    }
  }, [sensorData])

  return {
    sensorData,
    errors,
    isListening,
    startListening
  }
}
