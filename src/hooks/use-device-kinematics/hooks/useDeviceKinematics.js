import { useEffect, useState } from 'react'

import { useIIRFData } from '../../use-iirf-data'

import DeviceKinematics from '../lib/DeviceKinematics'

export default function useDeviceKinematics(options) {
  const [deviceKinematics, setDeviceKinematics] = useState(DeviceKinematics.initial)

  const { iirfData, rawSensorData, refreshRates, errors, isListening, startListening } = useIIRFData(options)

  useEffect(() => {
    setDeviceKinematics(new DeviceKinematics(iirfData))
  }, [iirfData])

  return { deviceKinematics, iirfData, rawSensorData, refreshRates, errors, isListening, startListening }
}
