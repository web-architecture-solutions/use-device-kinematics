import { useEffect, useState, useMemo } from 'react'

import DeviceKinematics from '../DeviceKinematics'

export default function useDeviceKinematics(sensorData) {
  const [stateVector, setStateVector] = useState([])
  const deviceKinematics = useMemo(() => new DeviceKinematics(sensorData), [sensorData])
  useEffect(() => {
    setStateVector(deviceKinematics.stateVector)
  }, [sensorData])
  return { stateVector }
}
