const deltaT = 1
const _Q = 0.01
const _R = 0.1

const F = [
  [1, deltaT, Math.pow(deltaT, 2) / 2, Math.pow(deltaT, 3) / 6, 0, 0], // Position update for X (x)
  [0, 1, deltaT, Math.pow(deltaT, 2) / 2, 0, 0], // Velocity update for X (v_x)
  [0, 0, 1, deltaT, 0, 0], // Acceleration update for X (a_x)
  [0, 0, 0, 1, 0, 0], // Jerk update for X (j_x)
  [0, 0, 0, 0, 0, deltaT], // Curvature update for X (k_x)
  [0, 0, 0, 0, 1, deltaT], // Position update for Y (y)
  [0, 0, 0, 0, 0, 1], // Velocity update for Y (v_y)
  [0, 0, 0, 0, 0, 0], // Acceleration update for Y (a_y)
  [0, 0, 0, 0, 0, 0], // Jerk update for Y (j_y)
  [0, 0, 0, 0, 0, 0], // Curvature update for Y (k_y)
  [0, 0, 0, 0, 1, 0] // Angular velocity update (ω) — prediction from curvature
]

const H = [
  [1, 0, 0, 0, 0, 0], // Position in X (x)
  [0, 0, 0, 0, 1, 0], // Velocity in X (v_x)
  [0, 0, 0, 0, 0, 1], // Acceleration in X (a_x)
  [0, 0, 0, 0, 0, 0], // Jerk in X (j_x)
  [0, 0, 0, 0, 0, 0], // Curvature in X (k_x)
  [0, 0, 0, 0, 0, 1], // Position in Y (y)
  [0, 0, 0, 0, 0, 0], // Velocity in Y (v_y)
  [0, 0, 0, 0, 0, 0], // Curvature in Y (k_y)
  [0, 0, 0, 0, 0, 1] // Angular velocity (ω) — prediction from curvature
]

const Q = [
  [_Q, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Position noise (x) - small uncertainty in position
  [0, _Q, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Velocity noise (x) - small uncertainty in velocity
  [0, 0, _Q, 0, 0, 0, 0, 0, 0, 0, 0], // Acceleration noise (x) - uncertainty in acceleration
  [0, 0, 0, _Q, 0, 0, 0, 0, 0, 0, 0], // Jerk noise (x) - uncertainty in jerk (rate of acceleration)
  [0, 0, 0, 0, _Q, 0, 0, 0, 0, 0, 0], // Curvature noise (x) - uncertainty in curvature (estimate from position)
  [0, 0, 0, 0, 0, _Q, 0, 0, 0, 0, 0], // Velocity noise (y) - similar to x-axis velocity
  [0, 0, 0, 0, 0, 0, _Q, 0, 0, 0, 0], // Acceleration noise (y) - uncertainty in y-axis acceleration
  [0, 0, 0, 0, 0, 0, 0, _Q, 0, 0, 0], // Jerk noise (y) - uncertainty in y-axis jerk
  [0, 0, 0, 0, 0, 0, 0, 0, _Q, 0, 0], // Curvature noise (y) - uncertainty in curvature (y-axis)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, _Q, 0], // Angular velocity noise (x)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _Q] // Angular velocity noise (y)
]

const R = [
  [_R, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Position measurement noise (x)
  [0, _R, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Velocity measurement noise (x)
  [0, 0, _R, 0, 0, 0, 0, 0, 0, 0, 0], // Acceleration measurement noise (x)
  [0, 0, 0, _R, 0, 0, 0, 0, 0, 0, 0], // Jerk measurement noise (x)
  [0, 0, 0, 0, _R, 0, 0, 0, 0, 0, 0], // Curvature measurement noise (x)
  [0, 0, 0, 0, 0, _R, 0, 0, 0, 0, 0], // Velocity measurement noise (y)
  [0, 0, 0, 0, 0, 0, _R, 0, 0, 0, 0], // Acceleration measurement noise (y)
  [0, 0, 0, 0, 0, 0, 0, _R, 0, 0, 0], // Jerk measurement noise (y)
  [0, 0, 0, 0, 0, 0, 0, 0, _R, 0, 0], // Curvature measurement noise (y)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, _R, 0], // Angular velocity measurement noise (x)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _R] // Angular velocity measurement noise (y)
]

export const kalmanFilterConfig = {
  initialMean: Array(10).fill([0]),
  initialCovariance: Array(10).fill([1000, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  transition: F,
  observation: H,
  processNoise: Q,
  observationNoise: R
}
