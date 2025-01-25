import { useState, useEffect, useMemo } from 'react'

import useClock from './useClock'

import { toRadians } from '../../../lib/math'

import IIRFData from '../lib/IIRFData'

export default function useIIRFilter(refreshRate, isListening, rawSensorData) {
  const [isClockRunning, setIsClockRunning] = useState(false)
  const [iirfData, setIIRFData] = useState(IIRFData.initial)
  const clockDelay = useMemo(() => 1000 / refreshRate, [refreshRate])
  const deltaT = useMemo(() => 1 / refreshRate, [refreshRate])
  const timestamp = useClock(clockDelay, isClockRunning)
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
              z: rawSensorData.altitude,
              deltaT
            },
            acceleration: {
              x: rawSensorData.acceleration.x,
              y: rawSensorData.acceleration.y,
              z: rawSensorData.acceleration.z,
              deltaT
            },
            orientation: {
              x: toRadians(rawSensorData.beta),
              y: toRadians(rawSensorData.gamma),
              z: toRadians(rawSensorData.alpha),
              deltaT
            },
            angularVelocity: {
              x: toRadians(rawSensorData.rotationRate.beta),
              y: toRadians(rawSensorData.rotationRate.gamma),
              z: toRadians(rawSensorData.rotationRate.alpha),
              deltaT
            }
          },
          previousIIRFData,
          deltaT
        )
      })
    }
  }, [isListening, timestamp])
  return iirfData
}
