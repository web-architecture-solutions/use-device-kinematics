const deltaT = 1
const _Q = 0.01
const _R = 0.1

const F = [
  [1, deltaT, Math.pow(deltaT, 2) / 2, Math.pow(deltaT, 3) / 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // position_x
  [0, 1, deltaT, Math.pow(deltaT, 2) / 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // velocity_x
  [0, 0, 1, deltaT, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // acceleration_x
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // jerk_x
  [0, 0, 0, 0, 1, deltaT, 0, 0, 0, 0, 0, 0, 0, 0, 0], // curvature1_x
  [0, 0, 0, 0, 0, 1, deltaT, Math.pow(deltaT, 2) / 2, 0, 0, 0, 0, 0, 0, 0], // position_y
  [0, 0, 0, 0, 0, 0, 1, deltaT, 0, 0, 0, 0, 0, 0, 0], // velocity_y
  [0, 0, 0, 0, 0, 0, 0, 1, deltaT, Math.pow(deltaT, 2) / 2, 0, 0, 0, 0], // acceleration_y
  [0, 0, 0, 0, 0, 0, 0, 0, 1, deltaT, 0, 0, 0, 0, 0], // jerk_y
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, deltaT, 0, 0, 0, 0], // curvature1_y
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, deltaT, 0, 0, 0], // angular_velocity_alpha
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, deltaT, 0, 0], // angular_velocity_beta
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, deltaT, 0], // angular_velocity_gamma
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // curvature2_x
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] // curvature2_y
]

const H = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // position_x
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // position_y
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // acceleration_x
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // acceleration_y
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // angular_velocity_alpha
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // angular_velocity_beta
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0] // angular_velocity_gamma
]

const Q = Array.from({ length: 11 }, (_, i) => Array.from({ length: 15 }, (_, j) => (i === j ? _Q : 0)))

const R = Array.from({ length: 9 }, (_, i) => Array.from({ length: 7 }, (_, j) => (i === j ? _R : 0)))

const initialCovariance = Array.from({ length: 11 }, (_, i) => Array.from({ length: 11 }, (_, j) => (i === j ? 1000 : 0)))

export const kalmanFilterConfig = {
  initialMean: Array(11).fill(0),
  initialCovariance,
  transition: F,
  observation: H,
  processNoise: Q,
  observationNoise: R
}
