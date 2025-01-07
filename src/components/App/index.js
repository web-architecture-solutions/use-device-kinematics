import useSensorData from '../../hooks/useSensorData'

export default function App() {
  const { data, errors, isListening, startListening } = useSensorData({ enableHighAccuracy: true })

  return (
    <div>
      <h1>Sensor Data</h1>

      {errors && Object.keys(errors).length > 0 ? <pre>{JSON.stringify(errors, null, 2)}</pre> : null}

      {isListening ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Click button to start.</p>}

      <button onClick={startListening} disabled={isListening}>
        {isListening ? 'OFF' : 'ON'}
      </button>
    </div>
  )
}
