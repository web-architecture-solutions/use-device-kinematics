const deltaT = 1
const _Q = 0.01
const _R = 0.1

const F = [
  [1, deltaT, Math.pow(deltaT, 2) / 2, Math.pow(deltaT, 3) / 6, 0, 0, 0, 0, 0, 0, 0], // Position update for X (x)
  [0, 1, deltaT, Math.pow(deltaT, 2) / 2, 0, 0, 0, 0, 0, 0, 0], // Velocity update for X (v_x)
  [0, 0, 1, deltaT, 0, 0, 0, 0, 0, 0, 0], // Acceleration update for X (a_x)
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // Jerk update for X (j_x)
  [0, 0, 0, 0, 1, deltaT, 0, 0, 0, 0, 0], // Curvature update for X (k_x)
  [0, 0, 0, 0, 0, 1, deltaT, Math.pow(deltaT, 2) / 2, 0, 0, 0], // Position update for Y (y)
  [0, 0, 0, 0, 0, 0, 1, deltaT, 0, 0, 0], // Velocity update for Y (v_y)
  [0, 0, 0, 0, 0, 0, 0, 1, deltaT, Math.pow(deltaT, 2) / 2, 0], // Acceleration update for Y (a_y)
  [0, 0, 0, 0, 0, 0, 0, 0, 1, deltaT, 0], // Jerk update for Y (j_y)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, deltaT], // Curvature update for Y (k_y)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] // Angular velocity update (ω)
]

const H = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Position in X (x)
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Velocity in X (v_x)
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], // Acceleration in X (a_x)
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // Jerk in X (j_x)
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], // Curvature in X (k_x)
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], // Position in Y (y)
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], // Velocity in Y (v_y)
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Curvature in Y (k_y)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] // Angular velocity (ω)
]

const Q = Array.from({ length: 11 }, (_, i) => Array.from({ length: 11 }, (_, j) => (i === j ? _Q : 0)))

const R = Array.from({ length: 9 }, (_, i) => Array.from({ length: 9 }, (_, j) => (i === j ? _R : 0)))

const initialCovariance = Array.from({ length: 11 }, (_, i) => Array.from({ length: 11 }, (_, j) => (i === j ? 1000 : 0)))

export const kalmanFilterConfig = {
  initialMean: Array(11).fill(0),
  initialCovariance,
  transition: F,
  observation: H,
  processNoise: Q,
  observationNoise: R
}
