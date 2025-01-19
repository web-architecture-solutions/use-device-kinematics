import { useRef, useState, useMemo, useEffect } from 'react'

import useClock from '../../hooks/useClock'
import useRawSensorData from './useRawSensorData'

import SensorData from '../SensorData'

import { toRadians } from '../../lib/math'

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
            y: rawSensorData.latitude,
            x: rawSensorData.longitude,
            z: rawSensorData.altitude
          },
          acceleration: {
            x: rawSensorData.acceleration.x,
            y: rawSensorData.acceleration.y,
            z: rawSensorData.acceleration.z
          },
          orientation: {
            z: toRadians(rawSensorData.alpha),
            x: toRadians(rawSensorData.beta),
            y: toRadians(rawSensorData.gamma)
          },
          angularVelocity: {
            z: toRadians(rawSensorData.rotationRate.alpha),
            x: toRadians(rawSensorData.rotationRate.beta),
            y: toRadians(rawSensorData.rotationRate.gamma)
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
