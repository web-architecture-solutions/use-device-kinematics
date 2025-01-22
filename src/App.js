//import { useDeviceKinematics } from './hooks'

import { useSensorData } from './hooks/use-sensor-data'

export default function App() {
  /*
  const { stateTransitionMatrix, stateVector, sensorData, refreshRates, errors, isListening, startListening } = useDeviceKinematics({
    enableHighAccuracy: true
  })
  */

  const { sensorData, errors, isListening, startListening } = useSensorData({ enableHighAccuracy: true })

  console.log('foo')

  return (
    <div>
      <h1>Sensor Data</h1>

      <button onClick={startListening}>{isListening ? 'Stop' : 'Start'}</button>

      <h2>Data</h2>

      <h3>Errors</h3>

      {errors && Object.keys(errors).length > 0 ? <pre>{JSON.stringify(errors, null, 2)}</pre> : null}

      <h3>Data</h3>

      {isListening ? <pre>{JSON.stringify({ sensorData: sensorData }, null, 2)}</pre> : <p>Click button to start.</p>}
    </div>
  )
}
