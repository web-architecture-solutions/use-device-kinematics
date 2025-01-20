import { useEffect, useState, useMemo } from 'react'

import DeviceKinematics from './DeviceKinematics'
import useSensorData from './hooks/useSensorData'

export default function useDeviceKinematics(options) {
  const [stateVector, setStateVector] = useState([])
  const [stateTransitionMatrix, setStateTransitionMatrix] = useState([[]])
  const { sensorData, errors, isListening, startListening } = useSensorData(options)
  const deviceKinematics = useMemo(() => new DeviceKinematics(sensorData), [sensorData])
  useEffect(() => {
    setStateVector(deviceKinematics.stateVector)
    setStateTransitionMatrix(deviceKinematics.stateTransitionMatrix)
  }, [sensorData])
  return { stateTransitionMatrix, stateVector, sensorData, errors, isListening, startListening }
}
