import useSensorData from './use-sensor-data/'
//import useDeviceKinematics from './use-device-kinematics/'

import useClock from './hooks/useClock'
import { useEffect, useMemo, useState } from 'react'

import usePrevious from './hooks/usePrevious'

export default function App() {
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)

  const [derivativesWrtT, setDerivativesWrtT] = useState({})
  const previousDerivativesWrtT = usePrevious(derivativesWrtT, {})

  const { timestamp, previousTimestamp } = useClock(sensorDataIsReady)

  const deltaT = useMemo(() => timestamp - previousTimestamp, [timestamp, previousTimestamp])

  const { sensorData, previousSensorData, errors, isListening, startListening } = useSensorData(
    { enableHighAccuracy: true },
    deltaT,
    previousDerivativesWrtT
  )

  useEffect(() => {
    setSensorDataIsReady(sensorData.isReady)
    setDerivativesWrtT(sensorData.derivativesWrtT)
  }, [sensorData])

  //const { stateVector } = useDeviceKinematics(sensorData)

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

      {isListening ? <pre>{JSON.stringify(derivativesWrtT, null, 2)}</pre> : <p>Click button to start.</p>}
    </div>
  )
}
