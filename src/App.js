import { useMemo } from 'react'

import useSensorData from './hooks/useSensorData'
import useClock from './hooks/useClock'

import DeviceKinematics from './lib/DeviceKinematics'

export default function App() {
  const { sensorData, errors, isListening, startListening } = useSensorData({ enableHighAccuracy: true })

  const { timestamp, previousTimestamp } = useClock(true)

  const stateVector = useMemo(() => {
    return new DeviceKinematics(sensorData, timestamp - previousTimestamp).stateVector
  }, [sensorData, timestamp, previousTimestamp])

  return (
    <div>
      <h1>Sensor Data</h1>

      <button onClick={startListening} disabled={isListening}>
        {isListening ? 'Listening...' : 'Start Listening'}
      </button>

      <h2>Data</h2>

      <h3>Errors</h3>

      {errors && Object.keys(errors).length > 0 ? <pre>{JSON.stringify(errors, null, 2)}</pre> : null}

      <h3>Data</h3>

      {isListening ? <pre>{JSON.stringify(stateVector, null, 2)}</pre> : <p>Click button to start.</p>}
    </div>
  )
}
