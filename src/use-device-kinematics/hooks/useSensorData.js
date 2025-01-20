import { useRef, useState, useMemo, useEffect } from 'react'

import useClock from './useClock'
import useRawSensorData from '../../use-raw-sensor-data'

import { toRadians } from '../../math'

import SensorData from '../SensorData'

export default function useSensorData(config = {}) {
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)
  const [derivativesWrtT, setDerivativesWrtT] = useState({})

  const { timestamp, previousTimestamp } = useClock(SensorData.deltaT, sensorDataIsReady)
  const { rawSensorData, errors, isListening, startListening } = useRawSensorData(config)

  const previousRawSensorDataRef = useRef(null)
  const previousDerivativesWrtTRef = useRef(null)

  const sensorData = useMemo(
    () =>
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
        previousRawSensorDataRef.current,
        previousDerivativesWrtTRef.current,
        timestamp,
        previousTimestamp
      ),
    [rawSensorData]
  )

  const initializeSensorData = () => {
    if (!sensorData.isReady && sensorDataIsReady) {
      throw new Error('useSensorData: Clock started before sensor data was ready')
    } else if (sensorData.isReady && !sensorDataIsReady) {
      setSensorDataIsReady(sensorData.isReady)
    }
  }

  const updateSensorData = () => {
    if (sensorData.isReady) {
      previousRawSensorDataRef.current = rawSensorData
      previousDerivativesWrtTRef.current = derivativesWrtT
      setDerivativesWrtT(sensorData.derivativesWrtT)
    }
  }

  useEffect(() => {
    initializeSensorData()
    updateSensorData()
  }, [sensorData])

  return {
    sensorData,
    errors,
    isListening,
    startListening
  }
}
