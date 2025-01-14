import { useEffect, useState } from 'react'

import DeviceKinematics from '../DeviceKinematics'

const deviceKinematics = new DeviceKinematics()

export default function useDeviceKinematics(sensorData, deltaT) {
  const [stateVector, setStateVector] = useState([])
  useEffect(() => {
    deviceKinematics.update(sensorData, deltaT)
    setStateVector(deviceKinematics.stateVector)
  }, [sensorData, deltaT])
  return { stateVector }
}
