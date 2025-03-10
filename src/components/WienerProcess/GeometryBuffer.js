import * as THREE from 'three'
import Point from './Point'

export default class GeometryBuffer {
  constructor(lineRef, parameters) {
    // Original interface preservation
    this.lineRef = lineRef
    this.parameters = {
      // Quantum defaults (transparent to existing users)
      numQubits: 1, // Single qubit for Bloch sphere visualization
      circuitDepth: 1000,
      entanglementProb: 0.0, // No entanglement for single-qubit Bloch sphere
      ...parameters
    }

    // Original buffer properties
    this.coords = new Float32Array(this.parameters.maxPoints * 3)
    this.colors = new Float32Array(this.parameters.maxPoints * 3)
    this.bufferIndex = 1
    this.isFull = false

    // Quantum state initialization
    this._quantumState = this.initializeQuantumState()
    this._currentCircuitDepth = 0
  }

  // Quantum helper methods (internal only)
  initializeQuantumState() {
    const theta = Math.acos(2 * Math.random() - 1) // Uniform polar angle
    const phi = Math.random() * 2 * Math.PI // Uniform azimuthal angle

    return {
      amplitudes: [
        Math.cos(theta / 2), // Real part (|0⟩ amplitude)
        Math.sin(theta / 2) * Math.cos(phi), // Imaginary part (|1⟩ amplitude, real component)
        Math.sin(theta / 2) * Math.sin(phi) // Imaginary part (|1⟩ amplitude, imaginary component)
      ]
    }
  }

  applyHadamard() {
    const [re, im] = this._quantumState.amplitudes
    const sqrt2 = Math.sqrt(2)

    // Hadamard transformation for a single qubit
    this._quantumState.amplitudes[0] = (re + im) / sqrt2 // New real part
    this._quantumState.amplitudes[1] = (re - im) / sqrt2 // New imaginary part
  }

  applyPhaseGate(phaseAngle) {
    const [re, im] = this._quantumState.amplitudes

    // Phase gate transformation: e^(i*phaseAngle)
    const cosPhase = Math.cos(phaseAngle)
    const sinPhase = Math.sin(phaseAngle)

    this._quantumState.amplitudes[0] = re * cosPhase - im * sinPhase // Real part
    this._quantumState.amplitudes[1] = re * sinPhase + im * cosPhase // Imaginary part
  }

  sampleQuantumState() {
    const [re, im] = this._quantumState.amplitudes

    // Convert amplitudes to probabilities (|a|^2 + |b|^2 should always equal 1)
    const probZero = re ** 2 + im ** 2
    return Math.random() < probZero ? 0 : 1 // Collapse to |0⟩ or |1⟩ randomly
  }

  mapToBlochSphere() {
    const [re, im] = this._quantumState.amplitudes

    // Convert quantum state to Bloch sphere coordinates:
    const theta = Math.acos(re) * 2 // Polar angle (z-axis rotation)
    const phi = Math.atan2(im, re) // Azimuthal angle (x-y plane rotation)

    const x = Math.sin(theta) * Math.cos(phi) // X-coordinate on Bloch sphere
    const y = Math.sin(theta) * Math.sin(phi) // Y-coordinate on Bloch sphere
    const z = Math.cos(theta) // Z-coordinate on Bloch sphere

    return new THREE.Vector3(x, y, z)
  }

  normalizeQuantumState() {
    let magnitude = 0
    for (let i = 0; i < this._quantumState.amplitudes.length; i++) {
      magnitude += this._quantumState.amplitudes[i] ** 2
    }
    magnitude = Math.sqrt(magnitude)
    for (let i = 0; i < this._quantumState.amplitudes.length; i++) {
      this._quantumState.amplitudes[i] /= magnitude
    }
  }

  get geometry() {
    return this.lineRef.current.geometry
  }

  get currentPointIndex() {
    return (this.bufferIndex - 1 + this.parameters.maxPoints) % this.parameters.maxPoints
  }

  get currentPoint() {
    return new Point(
      this.coords[this.currentPointIndex * 3],
      this.coords[this.currentPointIndex * 3 + 1],
      this.coords[this.currentPointIndex * 3 + 2]
    )
  }

  initialize() {
    this.coords.set([0, 0, 0], 0)
    this.colors.set([0.5, 0.5, 0.5], 0)
    Point.constraint = this.parameters.constraint
    Point.stepSize = this.parameters.stepSize
    return this
  }

  reorderArray(array) {
    const reorderedArray = new Float32Array(this.parameters.maxPoints * 3)
    const splitIndex = this.bufferIndex * 3
    reorderedArray.set(array.subarray(splitIndex), 0)
    reorderedArray.set(array.subarray(0, splitIndex), array.length - splitIndex)
    return reorderedArray
  }

  applyPauliX() {
    const [r, i1, i2] = this._quantumState.amplitudes

    // Pauli-X gate swaps |0⟩ and |1⟩ amplitudes
    this._quantumState.amplitudes = [i1, r, -i2]
  }

  applyRandomRotation() {
    const randomAxis = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()

    const randomAngle = Math.random() * Math.PI * 2

    this.applyRotation(randomAxis, randomAngle)
  }

  applyRotation(axis, angle) {
    const [x, y, z] = [this._quantumState.amplitudes[1], this._quantumState.amplitudes[2], this._quantumState.amplitudes[0]]

    const rotatedVector = new THREE.Vector3(x, y, z).applyAxisAngle(axis, angle)

    this._quantumState.amplitudes = [rotatedVector.z, rotatedVector.x, rotatedVector.y]
  }

  applyNoise() {
    for (let i = 0; i < this._quantumState.amplitudes.length; i++) {
      this._quantumState.amplitudes[i] += (Math.random() - 0.5) * 0.01 // Small random perturbation
    }
  }

  addNextPoint() {
    if (this._currentCircuitDepth < this.parameters.circuitDepth) {
      const randomGate = Math.random()
      if (randomGate < 0.33) {
        this.applyHadamard()
      } else if (randomGate < 0.66) {
        const randomPhase = Math.random() * Math.PI * 2
        this.applyPhaseGate(randomPhase)
      } else {
        const randomAngle = Math.random() * Math.PI * 2
        this.applyPhaseGate(randomAngle)
      }

      // Apply noise after gate application
      this.applyNoise()

      this.normalizeQuantumState()
      this._currentCircuitDepth++
    }

    const blochPoint = this.mapToBlochSphere()

    const nextPointCoords = [blochPoint.x, blochPoint.y, blochPoint.z]

    const nextColor = [(blochPoint.x + 1) / 2, (blochPoint.y + 1) / 2, (blochPoint.z + 1) / 2]

    this.coords.set(nextPointCoords, this.bufferIndex * 3)
    this.colors.set(nextColor, this.bufferIndex * 3)

    // Update buffer index and handle wrapping behavior
    this.bufferIndex = (this.bufferIndex + 1) % this.parameters.maxPoints
    if (this.bufferIndex === 0) {
      this.isFull = true
    }
  }

  updatePartialBuffer() {
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.coords, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setDrawRange(0, this.bufferIndex)
  }

  updateFullBuffer() {
    const reorderedPoints = this.reorderArray(this.coords)
    const reorderedColors = this.reorderArray(this.colors)
    this.geometry.setAttribute('position', new THREE.BufferAttribute(reorderedPoints, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(reorderedColors, 3))
    this.geometry.setDrawRange(0, this.parameters.maxPoints - 1)
  }

  mapToBlochSphere() {
    const [re, im] = this._quantumState.amplitudes

    // Convert quantum state to Bloch sphere coordinates:
    const theta = Math.acos(re) * 2 // Polar angle (z-axis rotation)
    const phi = Math.atan2(im, re) // Azimuthal angle (x-y plane rotation)

    const x = Math.sin(theta) * Math.cos(phi) // X-coordinate on Bloch sphere
    const y = Math.sin(theta) * Math.sin(phi) // Y-coordinate on Bloch sphere
    const z = Math.cos(theta) // Z-coordinate on Bloch sphere

    return new THREE.Vector3(x, y, z)
  }

  update() {
    this.addNextPoint()
    this.isFull ? this.updateFullBuffer() : this.updatePartialBuffer()
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
  }
}
