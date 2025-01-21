import useDeviceKinematics from './use-device-kinematics/'

const big = 1000000000000000

export default function App() {
  const { stateTransitionMatrix, stateVector, sensorData, errors, isListening, startListening } = useDeviceKinematics({
    enableHighAccuracy: true
  })

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

      {isListening ? (
        <pre>
          {JSON.stringify(
            Object.values(sensorData).map((variable) => {
              const deltaX = (big * variable.x - big * variable.previous.x) / big
              const deltaT = variable.timestamp - variable.previous.timestamp
              return {
                currentX: variable.x,
                previousX: variable.previous.x,
                areCurrentAndPreviousXEqual: variable.x === variable.previous.x,
                derivativeOfXWrtT: deltaX / deltaT,
                deltaX: deltaX,
                deltaT: deltaT,
                timestamp: variable.timestamp,
                previousTimestamp: variable.previous?.timestamp
              }
            }),
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
