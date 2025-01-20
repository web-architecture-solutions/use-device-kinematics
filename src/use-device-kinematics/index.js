import { useEffect, useState, useMemo } from 'react'

import DeviceKinematics from './DeviceKinematics'
import useSensorData from './hooks/useSensorData'

export default function useDeviceKinematics(options) {
  const [stateVector, setStateVector] = useState([])
  const { sensorData, errors, isListening, startListening } = useSensorData(options)
  const deviceKinematics = useMemo(() => new DeviceKinematics(sensorData), [sensorData])
  useEffect(() => setStateVector(deviceKinematics.stateVector), [sensorData])
  return { stateVector, sensorData, errors, isListening, startListening }
}
