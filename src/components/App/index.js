import useGeolocation from './hooks/useDeviceTelemetry/hooks/useGeolocation'

export default function App() {
  const { data, errors } = useGeolocation({ enableHighAccuracy: true })

  return (
    <div>
      <h1>Geolocation</h1>

      {errors && Object.keys(errors).length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Errors</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(errors).map(([_, message]) => (
              <tr>
                <td>{message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : data && Object.keys(data).length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Data</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}
