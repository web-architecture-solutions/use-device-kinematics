import React, { useState } from 'react'

// Function to compute the derivative using the finite difference method
const finiteDifference = (data, deltaTime) => {
  // Directly calculate the derivative (no need for indices)
  const derivative = ((data[data.length - 1] - data[0]) / (data.length - 1)) * deltaTime
  return derivative
}

class DifferentiationFilter {
  static sampleRate = 44100
  static feedforward = [1, -1]
  static feedback = [1, -0.95]

  static create = (context) => {
    return context.createIIRFilter(DifferentiationFilter.feedforward, DifferentiationFilter.feedback)
  }

  static async apply(data) {
    const offlineContext = new OfflineAudioContext(1, data.length, DifferentiationFilter.sampleRate)
    const buffer = offlineContext.createBuffer(1, data.length, DifferentiationFilter.sampleRate)
    const channelData = buffer.getChannelData(0)
    data.forEach((value, i) => (channelData[i] = value))
    const filter = DifferentiationFilter.create(offlineContext)
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
  const [dataPoints, setDataPoints] = useState([{ x: 0, y: 0, z: 0 }])
  const [derivativeFiniteDifference, setDerivativeFiniteDifference] = useState(null)
  const [derivativeDifferentiation, setDerivativeDifferentiation] = useState(null)

  const handleDataChange = (index, axis, value) => {
    const newData = [...dataPoints]
    newData[index][axis] = parseFloat(value)
    setDataPoints(newData)
  }

  const addDataPoint = () => {
    setDataPoints([...dataPoints, { x: 0, y: 0, z: 0 }])
  }

  const removeDataPoint = (index) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index))
  }

  const calculateDerivatives = async () => {
    const xData = dataPoints.map((point) => point.x)
    const yData = dataPoints.map((point) => point.y)
    const zData = dataPoints.map((point) => point.z)

    // Finite difference method
    const dxFinite = finiteDifference(xData, deltaT)
    const dyFinite = finiteDifference(yData, deltaT)
    const dzFinite = finiteDifference(zData, deltaT)

    setDerivativeFiniteDifference({ x: dxFinite, y: dyFinite, z: dzFinite })

    // Differentiation filter method
    const diffX = await DifferentiationFilter.apply(xData)
    const diffY = await DifferentiationFilter.apply(yData)
    const diffZ = await DifferentiationFilter.apply(zData)

    setDerivativeDifferentiation({ x: diffX[diffX.length - 1], y: diffY[diffY.length - 1], z: diffZ[diffZ.length - 1] })
  }

  return (
    <div>
      <h1>Derivative Approximation Comparison</h1>

      <div>
        <h2>Data Points</h2>
        {dataPoints.map((point, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <input type="number" value={point.x} onChange={(e) => handleDataChange(index, 'x', e.target.value)} placeholder="x" />
            <input type="number" value={point.y} onChange={(e) => handleDataChange(index, 'y', e.target.value)} placeholder="y" />
            <input type="number" value={point.z} onChange={(e) => handleDataChange(index, 'z', e.target.value)} placeholder="z" />
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

        <h3>Differentiation Filter Approximation</h3>
        <pre>{JSON.stringify(derivativeDifferentiation, null, 2)}</pre>
      </div>
    </div>
  )
}

export default App
