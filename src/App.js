import { useSensorData } from './hooks/use-sensor-data'

function calculateDerivativeWrtT(variable) {
  const deltaT = variable.timestamp - variable.previous.timestamp
  const calculateComponentDerivativeWrtT = (componentValue, index) => {
    const delta = componentValue - variable.previous[index]
    return delta / deltaT
  }
  return variable.map(calculateComponentDerivativeWrtT)
}

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
                derivativeWrtT1: variable.derivativeWrtT.derivativeWrtT,
                derivativeWrtT2: calculateDerivativeWrtT(variable),
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
