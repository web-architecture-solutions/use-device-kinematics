import { useRef, useState, useMemo, useEffect } from 'react'

import useClock from '../../hooks/useClock'
import useRawSensorData from './useRawSensorData'

import SensorData from '../SensorData'

export default function useSensorData(config = {}) {
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)
  const [derivativesWrtT, setDerivativesWrtT] = useState({})

  const { rawSensorData, errors, isListening, startListening } = useRawSensorData(config)

  const previousRawSensorDataRef = useRef(null)
  const previousDerivativesWrtTRef = useRef(null)

  const { timestamp, previousTimestamp } = useClock(sensorDataIsReady)

  const sensorData = useMemo(
    () =>
      new SensorData(
        {
          position: {
            latitude: rawSensorData.latitude,
            longitude: rawSensorData.longitude,
            altitude: rawSensorData.altitude
          },
          acceleration: {
            x: rawSensorData.acceleration.x,
            y: rawSensorData.acceleration.y,
            z: rawSensorData.acceleration.z
          },
          orientation: {
            alpha: rawSensorData.alpha,
            beta: rawSensorData.beta,
            gamma: rawSensorData.gamma
          },
          angularVelocity: {
            alpha: rawSensorData.rotationRate.alpha,
            beta: rawSensorData.rotationRate.beta,
            gamma: rawSensorData.rotationRate.gamma
          }
        },
        previousRawSensorDataRef.current,
        previousDerivativesWrtTRef.current,
        timestamp,
        previousTimestamp
      ),
    [rawSensorData]
  )

  useEffect(() => {
    if (sensorData.isReady && !sensorDataIsReady) {
      setSensorDataIsReady(sensorData.isReady)
    }

    if (sensorData.isReady) {
      previousRawSensorDataRef.current = rawSensorData
      previousDerivativesWrtTRef.current = derivativesWrtT
      setDerivativesWrtT(sensorData.derivativesWrtT)
    }
  }, [sensorData])

  return {
    sensorData,
    errors,
    isListening,
    startListening
  }
}
