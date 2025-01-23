//import { useDeviceKinematics } from './hooks'

import { useSensorData } from './hooks/use-sensor-data'

class DifferentiationFilter {
  constructor(feedforward, feedback, sampleRate) {
    this.feedforward = feedforward
    this.feedback = feedback
    this.sampleRate = sampleRate
  }

  async calculate(current, previous) {
    const offlineContext = new OfflineAudioContext(1, 2, this.sampleRate)
    const buffer = offlineContext.createBuffer(1, 2, this.sampleRate)
    const channelData = buffer.getChannelData(0)
    channelData[0] = current
    channelData[1] = previous
    const filter = offlineContext.createIIRFilter(this.feedforward, this.feedback)
    const source = offlineContext.createBufferSource()
    source.buffer = buffer
    source.connect(filter)
    filter.connect(offlineContext.destination)
    source.start()
    const renderedBuffer = await offlineContext.startRendering()
    const output = renderedBuffer.getChannelData(0)
    return output
  }
}

export default function App() {
  /*
  const { stateTransitionMatrix, stateVector, sensorData, refreshRates, errors, isListening, startListening } = useDeviceKinematics({
    enableHighAccuracy: true
  })
  */

  const { sensorData, errors, isListening, startListening } = useSensorData({ enableHighAccuracy: true })

  const feedforward = [1, -1]
  const feedback = [1, -1]
  const sampleRate = 44100
  const differentiationFilter = new DifferentiationFilter(feedforward, feedback, sampleRate)

  async function foo() {
    return await differentiationFilter.calculate(
      [0.0008943847843673673, 0.000438947834673563, 0.0000483873673673],
      [0.000037836743674784, 0.00004984783673676723, 0.000058954894783676732]
    )
  }

  return (
    <div>
      {JSON.stringify(foo)}

      <h1>Sensor Data</h1>

      <button onClick={startListening}>{isListening ? 'Stop' : 'Start'}</button>

      <h2>Data</h2>

      <h3>Errors</h3>

      {errors && Object.keys(errors).length > 0 ? <pre>{JSON.stringify(errors, null, 2)}</pre> : null}

      <h3>Data</h3>

      {isListening ? (
        <pre>
          {JSON.stringify(
            (sensorData.angularVelocity.x - sensorData.angularVelocity.previous.x) /
              (sensorData.angularVelocity.timestamp - sensorData.angularVelocity.previous.timestamp),
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
