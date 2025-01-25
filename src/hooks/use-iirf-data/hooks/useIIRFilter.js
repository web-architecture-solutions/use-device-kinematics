import { useState, useEffect } from 'react'

import useClock from './useClock'

import { toRadians } from '../../../lib/math'

import IIRFData from '../lib/IIRFData'

export default function useIIRFilter(refreshRate, isListening, rawSensorData) {
  const [startClock, setStartClock] = useState(false)
  const [iirfData, setIIRFData] = useState(IIRFData.initial)

  const { timestamp } = useClock(refreshRate, startClock)

  useEffect(() => {
    if (isListening && !startClock) setStartClock(true)
    if (isListening) {
      setIIRFData((previousIIRFData) => {
        return new IIRFData(
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
          previousIIRFData
        )
      })
    }
  }, [isListening, timestamp])

  return iirfData
}
