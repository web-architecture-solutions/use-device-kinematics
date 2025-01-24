import { useState, useEffect } from 'react'

import useClock from './useClock'

import { toRadians } from '../../../lib/math'

import IIRFData from '../lib/IIRFData'

export default function useIIRFilter(rawSensorData, isListening) {
  const [iirfData, setIIRFData] = useState(IIRFData.initial)
  const [startClock, setStartClock] = useState(false)

  const { timestamp } = useClock(4, startClock)

  useEffect(() => {
    if (isListening) {
      if (!startClock) setStartClock(true)
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
  }, [rawSensorData])

  return iirfData
}
