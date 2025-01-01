import useDeviceMotion from './hooks/useDeviceTelemetry/hooks/useDeviceMotion'

export default function App() {
  const { data, errors, isListening, startListening } = useDeviceMotion()

  return (
    <div>
      <h1>Sensor Data</h1>

      {errors && errors.length > 0 ? (
        Object.entries(errors).map(([_, message]) => <p>Error: {message}</p>)
      ) : data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>{isListening ? 'Listening for data...' : 'Click the button to start.'}</p>
      )}

      <button onClick={startListening} disabled={isListening}>
        {isListening ? 'Listening...' : 'Start Listening'}
      </button>
    </div>
  )
}
