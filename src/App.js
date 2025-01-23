import { useSensorData } from './hooks/use-sensor-data'

export default function App() {
  const { sensorData, errors, isListening, startListening } = useSensorData({ enableHighAccuracy: true })

  return (
    <div>
      <h1>Sensor Data</h1>

      <button onClick={startListening}>{isListening ? 'Stop' : 'Start'}</button>

      <h2>Data</h2>

      <h3>Errors</h3>

      {errors && Object.keys(errors).length > 0 ? <pre>{JSON.stringify(errors, null, 2)}</pre> : null}

      <h3>Data</h3>

      {isListening ? (
        <pre>
          {JSON.stringify(
            ((variable) => {
              return {
                current: variable,
                previous: variable.previous,
                areEqual: variable.isEqual(variable.previous),
                timestamp: variable.timestamp,
                previousTimestamp: variable.previous.timestamp,
                areTimestampsEqual: variable.timestamp === variable.previous.timestamp,
                derivativeWrtT: variable.derivativeWrtT.derivativeWrtT,
                previousDerivativeWrtT: variable.previous.derivativeWrtT
              }
            })(sensorData.angularVelocity),
            null,
            2
          )}
        </pre>
      ) : (
        <p>Click button to start.</p>
      )}
    </div>
  )
}
