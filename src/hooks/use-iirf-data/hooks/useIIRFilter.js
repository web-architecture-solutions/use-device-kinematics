import { useState, useEffect, useMemo } from 'react'

import useClock from './useClock'

import { toRadians } from '../../../lib/math'

import IIRFData from '../lib/IIRFData'

import { isNullOrUndefined } from '../lib/util'

export default function useIIRFilter(refreshRate, isListening, rawSensorData) {
  const [startClock, setStartClock] = useState(false)
  const [iirfData, setIIRFData] = useState(IIRFData.initial)

  const deltaT = useMemo(() => 1000 / refreshRate, [refreshRate])

  const { timestamp } = useClock(deltaT, startClock)

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
              timestamp: timestamp ?? null,
              deltaT
            },
            acceleration: {
              x: rawSensorData.acceleration.x,
              y: rawSensorData.acceleration.y,
              z: rawSensorData.acceleration.z,
              timestamp: timestamp ?? null,
              deltaT
            },
            orientation: {
              x: toRadians(rawSensorData.beta),
              y: toRadians(rawSensorData.gamma),
              z: toRadians(rawSensorData.alpha),
              timestamp: timestamp ?? null,
              deltaT
            },
            angularVelocity: {
              x: toRadians(rawSensorData.rotationRate.beta),
              y: toRadians(rawSensorData.rotationRate.gamma),
              z: toRadians(rawSensorData.rotationRate.alpha),
              timestamp: timestamp ?? null,
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
