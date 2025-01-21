import { useState, useEffect } from 'react'

import useClock from './useClock'
import useRawSensorData from '../../use-raw-sensor-data'

import { toRadians } from '../../../lib/math'

import SensorData from '../SensorData'

export default function useSensorData(config = {}) {
  const [sensorData, setSensorData] = useState(SensorData.initial)
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)

  const { timestamp } = useClock(SensorData.deltaT, sensorDataIsReady)
  const { refreshRates, rawSensorData, errors, isListening, startListening } = useRawSensorData(config)

  useEffect(() => {
    setSensorData(
      (previousRawSensorData) =>
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
          previousRawSensorData,
          previousRawSensorData?.derivativesWrtT ?? null,
          timestamp
        )
    )
  }, [rawSensorData, timestamp])

  useEffect(() => {
    if (!sensorData.isReady && sensorDataIsReady) {
      throw new Error('useSensorData: Clock started before sensor data was ready')
    } else if (sensorData.isReady && !sensorDataIsReady) {
      setSensorDataIsReady(sensorData.isReady)
    }
  }, [sensorData])

  return {
    sensorData,
    refreshRates,
    errors,
    isListening,
    startListening
  }
}
