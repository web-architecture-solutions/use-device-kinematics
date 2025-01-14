import useSensorData from './use-sensor-data/'
import useDeviceKinematics from './use-device-kinematics/'

import useClock from './hooks/useClock'
import { useEffect, useState } from 'react'

export default function App() {
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)

  const { timestamp, previousTimestamp } = useClock(sensorDataIsReady)

  const { sensorData, errors, isListening, startListening } = useSensorData({ enableHighAccuracy: true }, timestamp - previousTimestamp)

  useEffect(() => {
    setSensorDataIsReady(sensorData.isReady)
  }, [sensorData.isReady])

  const { stateVector } = useDeviceKinematics(sensorData, timestamp - previousTimestamp)

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
