import { useRef, useState, useEffect, useCallback } from 'react'

// Minimal matrix operations for Kalman filter
function matrixAdd(A, B) {
  return A.map((row, i) => row.map((val, j) => val + B[i][j]))
}

function matrixSubtract(A, B) {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]))
}

function matrixMultiply(A, B) {
  const rowsA = A.length
  const colsA = A[0].length
  const colsB = B[0].length
  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0))
  for (let i = 0; i < rowsA; i++) {
    for (let k = 0; k < colsA; k++) {
      for (let j = 0; j < colsB; j++) {
        result[i][j] += A[i][k] * B[k][j]
      }
    }
  }
  return result
}

function matrixTranspose(A) {
  return A[0].map((_, j) => A.map((row) => row[j]))
}

function identityMatrix(size) {
  return Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => (i === j ? 1 : 0)))
}

function matrixInverse(matrix) {
  const n = matrix.length
  // Augment with identity
  const aug = matrix.map((row, i) => [...row, ...identityMatrix(n)[i]])

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
        maxRow = k
      }
    }
    ;[aug[i], aug[maxRow]] = [aug[maxRow], aug[i]]

    const pivot = aug[i][i]
    if (Math.abs(pivot) < 1e-12) {
      throw new Error('Matrix is singular and cannot be inverted')
    }
    // Normalize pivot row
    for (let j = 0; j < 2 * n; j++) aug[i][j] /= pivot
    // Eliminate other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = aug[k][i]
        for (let j = 0; j < 2 * n; j++) aug[k][j] -= factor * aug[i][j]
      }
    }
  }

  // Extract inverse
  return aug.map((row) => row.slice(n))
}

export class KalmanFilter {
  /**
   * @param {{ dynamic: { init: {mean: number[][], covariance: number[][]}, transition: number[][], covariance: number[][] },
   * observation: { stateProjection: number[][], covariance: number[][] } }} config
   */
  constructor({ dynamic, observation }) {
    this.F = dynamic.transition
    this.Q = dynamic.covariance
    this.H = observation.stateProjection
    this.R = observation.covariance
    this.xInit = dynamic.init.mean
    this.PInit = dynamic.init.covariance
  }

  /**
   * Runs one Kalman filter predict-update cycle.
   * @param {{ previousCorrected: { mean: number[][], covariance: number[][] } | null, observation: number[][] }} params
   * @returns {{ mean: number[][], covariance: number[][] }} corrected state
   */
  filter({ previousCorrected, observation: z }) {
    let xPrior, PPrior

    if (!previousCorrected) {
      xPrior = this.xInit
      PPrior = this.PInit
    } else {
      const xPrev = previousCorrected.mean
      const PPrev = previousCorrected.covariance
      // Predict
      xPrior = matrixMultiply(this.F, xPrev)
      PPrior = matrixAdd(matrixMultiply(this.F, matrixMultiply(PPrev, matrixTranspose(this.F))), this.Q)
    }

    // Measurement update
    const Ht = matrixTranspose(this.H)
    const S = matrixAdd(matrixMultiply(this.H, matrixMultiply(PPrior, Ht)), this.R)
    const K = matrixMultiply(matrixMultiply(PPrior, Ht), matrixInverse(S))
    const y = matrixSubtract(z, matrixMultiply(this.H, xPrior))
    const xPost = matrixAdd(xPrior, matrixMultiply(K, y))
    const size = PPrior.length
    const I = identityMatrix(size)
    const PPost = matrixMultiply(matrixSubtract(I, matrixMultiply(K, this.H)), PPrior)

    return { mean: xPost, covariance: PPost }
  }
}

// Helper to convert 1D array into column vector
function toColumnMatrix(arr) {
  return arr.map((value) => [value])
}

// Helper to create a block diagonal matrix
function createBlockDiagonalMatrix(blocks) {
  const numBlocks = blocks.length
  const blockSize = blocks[0].length
  const resultSize = numBlocks * blockSize
  const result = Array.from({ length: resultSize }, () => Array(resultSize).fill(0))

  for (let i = 0; i < numBlocks; i++) {
    for (let row = 0; row < blockSize; row++) {
      for (let col = 0; col < blockSize; col++) {
        result[i * blockSize + row][i * blockSize + col] = blocks[i][row][col]
      }
    }
  }

  return result
}

/**
 * Custom React hook for Kalman filtering device kinematics assuming constant jerk and constant angular jerk.
 * @param {{ stateVector: number[], processNoiseMatrix: number[][], timeStep: number,
 * observationMatrix: number[][], observationNoiseMatrix: number[][], measuredVariables: number[][] }} deviceKinematics
 */
export default function useKalmanFilter(deviceKinematics) {
  const filterRef = useRef(null)
  const previousCorrectedRef = useRef(null)
  const [filteredState, setFilteredState] = useState(null)
  const [observations, setObservations] = useState([])

  // Initialize or reset filter when kinematic config changes
  useEffect(() => {
    const { stateVector, processNoiseMatrix, timeStep, observationMatrix, observationNoiseMatrix } = deviceKinematics

    if (!timeStep) {
      console.warn('Time step (timeStep) is not provided in deviceKinematics. Assuming a default value of 1.')
    }
    const dt = timeStep || 1

    const nLinear = 3 // x, y, z
    const nAngular = 3 // roll, pitch, yaw (assuming Euler angles)
    const stateSizePerAxis = 4 // position, velocity, acceleration, jerk

    const linearTransitionBlock = [
      [1, dt, 0.5 * dt * dt, (1 / 6) * dt * dt * dt],
      [0, 1, dt, 0.5 * dt * dt],
      [0, 0, 1, dt],
      [0, 0, 0, 1]
    ]

    const angularTransitionBlock = [
      [1, dt, 0.5 * dt * dt, (1 / 6) * dt * dt * dt],
      [0, 1, dt, 0.5 * dt * dt],
      [0, 0, 1, dt],
      [0, 0, 0, 1]
    ]

    const transitionMatrixBlocks = Array(nLinear + nAngular).fill(linearTransitionBlock)
    const stateTransitionMatrix = createBlockDiagonalMatrix(transitionMatrixBlocks)

    filterRef.current = new KalmanFilter({
      dynamic: {
        init: {
          mean: toColumnMatrix(stateVector),
          covariance: processNoiseMatrix
        },
        transition: stateTransitionMatrix,
        covariance: processNoiseMatrix
      },
      observation: {
        stateProjection: observationMatrix,
        covariance: observationNoiseMatrix
      }
    })
    previousCorrectedRef.current = null
    setFilteredState(null)
    setObservations([])
  }, [deviceKinematics])

  // Process each incoming measurement
  useEffect(() => {
    const measured = deviceKinematics.measuredVariables.flat()
    const z = toColumnMatrix(measured)
    setObservations((prev) => [...prev, z])

    const corrected = filterRef.current.filter({
      previousCorrected: previousCorrectedRef.current,
      observation: z
    })

    previousCorrectedRef.current = corrected
    setFilteredState(corrected)
  }, [deviceKinematics])

  const reset = useCallback(() => {
    previousCorrectedRef.current = null
    setFilteredState(null)
    setObservations([])
  }, [])

  return { state: filteredState, observations, reset }
}
