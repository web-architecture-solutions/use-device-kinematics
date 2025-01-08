import { useEffect } from 'react'

import useSensorData from './hooks/useSensorData'

import use2DKalmanFilter from './hooks/use2DKalmanFilter'

import { kalmanFilterConfig } from './constants'

export default function App() {
  const { data, errors, isListening, startListening } = useSensorData({ enableHighAccuracy: true })

  return (
    <div>
      <h1>Sensor Data</h1>

      <button onClick={startListening} disabled={isListening}>
        {isListening ? 'Start Listening' : 'Listening...'}
      </button>

      {/*
      <button onClick={reset}>Reset Filter</button>
      */}

      <h2>Raw Data</h2>

      <h3>Errors</h3>
      {errors && Object.keys(errors).length > 0 ? <pre>{JSON.stringify(errors, null, 2)}</pre> : null}

      <h3>Data</h3>
      {isListening ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Click button to start.</p>}

      <h2>Filtered Data</h2>

      {/*
      <pre>Current State Mean: {JSON.stringify(state.mean)}</pre>
      <pre>Current State Covariance: {JSON.stringify(state.covariance)}</pre>
      */}
    </div>
  )
}
