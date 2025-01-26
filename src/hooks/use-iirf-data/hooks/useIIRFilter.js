import { useState, useEffect, useMemo } from 'react'

import useClock from './useClock'

import { toRadians } from '../../../lib/math'

import IIRFData from '../lib/IIRFData'

const refreshRate = 250

export default function useIIRFilter(isListening, rawSensorData, refreshRates) {
  const [isClockRunning, setIsClockRunning] = useState(false)
  const [iirfData, setIIRFData] = useState(IIRFData.initial)
  const deltaT = useMemo(() => 1 / refreshRate, [refreshRate])
  const timestamp = useClock(1000 / refreshRate, isClockRunning)
  useEffect(() => {
    if (!isListening && isClockRunning) setIsClockRunning(false)
    if (isListening && !isClockRunning) setIsClockRunning(true)
    if (isListening) {
      setIIRFData((previousIIRFData) => {
        return new IIRFData(
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
          previousIIRFData,
          deltaT,
          refreshRates
        )
      })
    }
  }, [isListening, timestamp])
  return iirfData
}
