import useGeolocation from './hooks/useDeviceTelemetry/hooks/useGeolocation'

export default function App() {
  const { data, errors } = useGeolocation()

  return (
    <div>
      <h1>Sensor Data</h1>

      {errors && errors.length > 0 ? (
        Object.entries(errors).map(([_, message]) => <p>Error: {message}</p>)
      ) : data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : null}
    </div>
  )
}
