import { useMemo } from 'react'

import { useIIRFData } from '../../use-iirf-data'

import DeviceKinematics from '../lib/DeviceKinematics'

export default function useDeviceKinematics(options) {
  const { iirfData, rawSensorData, refreshRates, errors, isListening, startListening } = useIIRFData(options)

  const deviceKinematics = useMemo(() => new DeviceKinematics(iirfData), [iirfData])

  return { deviceKinematics, iirfData, rawSensorData, refreshRates, errors, isListening, startListening }
}
