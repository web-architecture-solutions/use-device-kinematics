import useDeviceOrientation from './hooks/useDeviceTelemetry/hooks/useDeviceOrientation'

export default function App() {
  const { data, errors, isListening, startListening } = useDeviceOrientation()

  return (
    <div>
      <h1>Device Orientation Data</h1>

      {errors && errors.length > 0 ? (
        Object.entries(errors).map(({ message }) => <p>Error: {message}</p>)
      ) : data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>{isListening ? 'Listening for orientation data...' : 'Click the button to start.'}</p>
      )}

      <button onClick={startListening} disabled={isListening}>
        {isListening ? 'Listening...' : 'Start Listening'}
      </button>
    </div>
  )
}
