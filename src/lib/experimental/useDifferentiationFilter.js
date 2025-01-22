import React, { useState } from 'react'

const finiteDifference = (data, deltaTime) => {
  const derivative = ((data[data.length - 1] - data[0]) / (data.length - 1)) * deltaTime
  return derivative
}

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

const deltaT = 1

const App = () => {
  const [dataPoints, setDataPoints] = useState([[0, 0, 0]])
  const [derivativeFiniteDifference, setDerivativeFiniteDifference] = useState(null)
  const [derivativeDifferentiation, setDerivativeDifferentiation] = useState(null)
  const [timeFiniteDifference, setTimeFiniteDifference] = useState(null)
  const [timeDifferentiation, setTimeDifferentiation] = useState(null)

  const handleDataChange = (index, axis, value) => {
    const newData = [...dataPoints]
    newData[index][axis] = parseFloat(value)
    setDataPoints(newData)
  }

  const addDataPoint = () => {
    setDataPoints([...dataPoints, [0, 0, 0]])
  }

  const removeDataPoint = (index) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index))
  }

  const calculateDerivatives = async () => {
    const xData = dataPoints.map(([x]) => x)
    const yData = dataPoints.map(([, y]) => y)
    const zData = dataPoints.map(([, , z]) => z)

    // Finite difference method timing
    const startFD = performance.now()
    const dxFinite = finiteDifference(xData, deltaT)
    const dyFinite = finiteDifference(yData, deltaT)
    const dzFinite = finiteDifference(zData, deltaT)
    const endFD = performance.now()

    setDerivativeFiniteDifference({ x: dxFinite, y: dyFinite, z: dzFinite })
    setTimeFiniteDifference((endFD - startFD).toFixed(2)) // Time in milliseconds

    // Differentiation filter method timing
    const startDF = performance.now()
    const feedforward = [1, -1]
    const feedback = [1, -1]
    const sampleRate = 44100
    const differentiationFilter = new DifferentiationFilter(feedforward, feedback, sampleRate)

    const diffX = await differentiationFilter.calculate(xData[0], xData[1])
    const diffY = await differentiationFilter.calculate(yData[0], yData[1])
    const diffZ = await differentiationFilter.calculate(zData[0], zData[1])
    const endDF = performance.now()

    setDerivativeDifferentiation({ x: diffX[diffX.length - 1], y: diffY[diffY.length - 1], z: diffZ[diffZ.length - 1] })
    setTimeDifferentiation((endDF - startDF).toFixed(2)) // Time in milliseconds
  }

  return (
    <div>
      <h1>Derivative Approximation Comparison</h1>

      <div>
        <h2>Data Points</h2>
        {dataPoints.map((point, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <input type="number" value={point[0]} onChange={(e) => handleDataChange(index, 0, e.target.value)} placeholder="x" />
            <input type="number" value={point[1]} onChange={(e) => handleDataChange(index, 1, e.target.value)} placeholder="y" />
            <input type="number" value={point[2]} onChange={(e) => handleDataChange(index, 2, e.target.value)} placeholder="z" />
            <button onClick={() => removeDataPoint(index)}>Remove</button>
          </div>
        ))}
        <button onClick={addDataPoint}>Add Data Point</button>
      </div>

      <button onClick={calculateDerivatives}>Calculate Derivatives</button>

      <div>
        <h2>Results</h2>
        <h3>Finite Difference Method</h3>
        <pre>{JSON.stringify(derivativeFiniteDifference, null, 2)}</pre>
        <p>Time: {timeFiniteDifference} ms</p>

        <h3>Differentiation Filter Approximation</h3>
        <pre>{JSON.stringify(derivativeDifferentiation, null, 2)}</pre>
        <p>Time: {timeDifferentiation} ms</p>
      </div>
    </div>
  )
}

export default App
