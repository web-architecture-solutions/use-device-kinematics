import React, { useState } from 'react'

// Function to compute the derivative using the finite difference method
const finiteDifference = (data, deltaTime) => {
  // Directly calculate the derivative (no need for indices)
  const derivative = ((data[data.length - 1] - data[0]) / (data.length - 1)) * deltaTime
  return derivative
}

// Function to create an IIR Differentiation filter
const createDifferentiationFilter = (context, sampleRate) => {
  const feedforward = [1, -1] // First-order difference
  const feedback = [1, -0.95] // Feedback for stability (adjust as needed)
  return context.createIIRFilter(feedforward, feedback)
}

// Function to apply the IIR Differentiation filter and return the result
const applyDifferentiationFilter = async (data) => {
  const sampleRate = 44100 // Standard sample rate
  const offlineContext = new OfflineAudioContext(1, data.length, sampleRate)

  const buffer = offlineContext.createBuffer(1, data.length, sampleRate)
  const channelData = buffer.getChannelData(0)
  data.forEach((value, i) => {
    channelData[i] = value
  })

  const filter = createDifferentiationFilter(offlineContext, sampleRate)
  const source = offlineContext.createBufferSource()
  source.buffer = buffer

  source.connect(filter)
  filter.connect(offlineContext.destination)

  source.start()

  const renderedBuffer = await offlineContext.startRendering()
  const output = renderedBuffer.getChannelData(0)
  return output
}

// React Component with updated differentiation filter logic
const App = () => {
  const [dataPoints, setDataPoints] = useState([{ x: 0, y: 0, z: 0 }])
  const [derivativeFiniteDifference, setDerivativeFiniteDifference] = useState(null)
  const [derivativeDifferentiation, setDerivativeDifferentiation] = useState(null)
  const [deltaTime, setDeltaTime] = useState(0.1) // Time step

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
    const dxFinite = finiteDifference(xData, deltaTime)
    const dyFinite = finiteDifference(yData, deltaTime)
    const dzFinite = finiteDifference(zData, deltaTime)

    setDerivativeFiniteDifference({ x: dxFinite, y: dyFinite, z: dzFinite })

    // Differentiation filter method
    const diffX = await applyDifferentiationFilter(xData)
    const diffY = await applyDifferentiationFilter(yData)
    const diffZ = await applyDifferentiationFilter(zData)

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

      <div>
        <h2>Settings</h2>
        <label>
          Delta Time (s):
          <input type="number" value={deltaTime} onChange={(e) => setDeltaTime(parseFloat(e.target.value))} step="0.01" />
        </label>
        <br />
        <button onClick={calculateDerivatives}>Calculate Derivatives</button>
      </div>

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
