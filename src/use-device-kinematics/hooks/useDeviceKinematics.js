import { useEffect, useState } from 'react'

import useClock from './useClock'

import DeviceKinematics from '../DeviceKinematics'

const deviceKinematics = new DeviceKinematics()

export default function useDeviceKinematics(sensorData) {
  const { timestamp, previousTimestamp } = useClock(true)
  const [stateVector, setStateVector] = useState([])
  useEffect(() => {
    const deltaT = timestamp - previousTimestamp
    deviceKinematics.update(sensorData, deltaT)
    setStateVector(deviceKinematics.stateVector)
  }, [sensorData, timestamp, previousTimestamp])
  return { stateVector }
}
