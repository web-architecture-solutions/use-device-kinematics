//import { useDeviceKinematics } from './hooks'

import { useRawSensorData } from './hooks/use-raw-sensor-data'

export default function App() {
  /*
  const { stateTransitionMatrix, stateVector, sensorData, refreshRates, errors, isListening, startListening } = useDeviceKinematics({
    enableHighAccuracy: true
  })
  */

  const { rawSensorData, errors, isListening, startListening } = useRawSensorData({ enableHighAccuracy: true })

  return (
    <div>
      <h1>Sensor Data</h1>

      <button onClick={startListening}>{isListening ? 'Listening...' : 'Start Listening'}</button>

      <h2>Data</h2>

      <h3>Errors</h3>

      {errors && Object.keys(errors).length > 0 ? <pre>{JSON.stringify(errors, null, 2)}</pre> : null}

      <h3>Data</h3>

      {isListening ? <pre>{JSON.stringify({ rawSensorData: rawSensorData }, null, 2)}</pre> : <p>Click button to start.</p>}
    </div>
  )
}
