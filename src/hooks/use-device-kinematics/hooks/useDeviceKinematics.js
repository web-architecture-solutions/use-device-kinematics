import { useEffect, useState } from 'react'

import DeviceKinematics from '../lib/DeviceKinematics'
import { useSensorData } from '../../use-sensor-data'

export default function useDeviceKinematics(options) {
  const [deviceKinematics, setDeviceKinematics] = useState(DeviceKinematics.initial)
  const [stateVector, setStateVector] = useState([])
  const [stateTransitionMatrix, setStateTransitionMatrix] = useState([[]])
  const { sensorData, refreshRates, errors, isListening, startListening } = useSensorData(options)
  useEffect(() => setDeviceKinematics(new DeviceKinematics(sensorData)), [sensorData])
  useEffect(() => {
    setStateVector(deviceKinematics.stateVector)
    setStateTransitionMatrix(deviceKinematics.stateTransitionMatrix)
  }, [sensorData])
  return { stateTransitionMatrix, stateVector, sensorData, refreshRates, errors, isListening, startListening }
}
