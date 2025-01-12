import { toRadians, euclideanNorm, Matrix } from './math'

import SensorData from './SensorData'

export default class DeviceKinematics {
  constructor(rawSensorData, previousRawSensorData, deltaT) {
    const sensorData = new SensorData(rawSensorData, previousRawSensorData, {
      position: { latitude: 'y', longitude: 'x', altitude: 'z' },
      orientation: { alpha: 'yaw', beta: 'pitch', gamma: 'roll' },
      angularVelocity: { alpha: 'z', beta: 'x', gamma: 'y' }
    })

    this.dimension = 3
    this.sensorData = sensorData
    this.position = sensorData.position
    this.accelerationSensorData = sensorData.acceleration
    this.angularVelocitySensorData = sensorData.angularVelocity
    this.orientation = sensorData.orientation
    this.deltaT = deltaT
  }

  haversineDistance({ x, y, z }, { x: previousX, y: previousY, z: previousZ }) {
    const coordinates2D = [x, previousX, y, previousY]
    if (coordinates2D.some((coordinate) => coordinate === null)) {
      return { x: null, y: null, z: null, xy: null, xyz: null }
    }

    const R = 6371000

    const deltaX = toRadians(x - previousX)
    const deltaY = toRadians(y - previousY)
    const deltaZ = z - previousZ

    const lat1 = toRadians(previousY)
    const lat2 = toRadians(y)

    const a = Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaX / 2) * Math.sin(deltaX / 2)
    const b = Math.sin(deltaY / 2) * Math.sin(deltaY / 2) + a
    const c = 2 * Math.atan2(Math.sqrt(b), Math.sqrt(1 - b))

    const xy = c * R

    return {
      x: deltaX * R * Math.cos((lat1 + lat2) / 2),
      y: deltaY * R,
      z: deltaZ,
      xy: c * R,
      xyz: Math.sqrt(xy * xy + z * z)
    }
  }

  derivativeWrtT(delta) {
    return delta / this.deltaT
  }

  deriveVelocityFromPosition(current, previous) {
    const displacement = this.haversineDistance(current, previous)
    const displacementToVelocity = ([component, delta]) => [component, this.derivativeWrtT(delta)]
    return Object.fromEntries(Object.entries(displacement).map(displacementToVelocity))
  }

  _derivativesWrtT(current, previous) {
    return Object.fromEntries(
      Object.entries(current).map(([component, value]) => {
        const delta = value - previous[component]
        return [component, this.derivativeWrtT(delta)]
      })
    )
  }

  derivativesWrtT(variable) {
    const { previous, ...current } = variable
    if (current && previous) {
      return variable === this.position ? this.deriveVelocityFromPosition(current, previous) : this._derivativesWrtT(current, previous)
    }
    return {}
  }

  get velocityFromPosition() {
    return this.derivativesWrtT(this.position)
  }

  get acceleration() {
    return {
      ...this.accelerationSensorData,
      xy: euclideanNorm(this.accelerationSensorData.x, this.accelerationSensorData.y),
      xyz: euclideanNorm(this.accelerationSensorData.x, this.accelerationSensorData.y, this.accelerationSensorData.z)
    }
  }

  get jerkFromAcceleration() {
    return this.derivativesWrtT(this.acceleration)
  }

  get angularVelocity() {
    return {
      ...this.angularVelocitySensorData,
      xy: euclideanNorm(toRadians(this.angularVelocitySensorData.x), toRadians(this.angularVelocitySensorData.y)),
      xyz: euclideanNorm(
        toRadians(this.angularVelocitySensorData.z),
        toRadians(this.angularVelocitySensorData.x),
        toRadians(this.angularVelocitySensorData.y)
      )
    }
  }

  get angularAccelerationFromVelocity() {
    return this.derivativesWrtT(this.angularVelocity)
  }

  get angularJerkFromAcceleration() {
    return this.derivativesWrtT(this.angularAccelerationFromVelocity)
  }

  get stateVector() {
    return [this.position, this.acceleration, this.orientation, this.angularVelocity, this.velocityFromPosition]
  }

  get leverArmEffectJacobian() {
    return {
      wrtAlpha: new Matrix([
        [0, -this.position.offset.z, this.position.offset.y],
        [this.position.offset.z, 0, -this.position.offset.x],
        [-this.position.offset.y, this.position.offset.x, 0]
      ]),
      wrtOmega: new Matrix([
        [
          0,
          -2 * this.angularVelocity.z * this.position.offset,
          2 * this.angularVelocity.y * this.position.offset.y +
            this.angularVelocity.y * this.position.offset.z -
            this.angularVelocity.z * this.position.offset.x
        ],
        [
          2 * this.angularVelocity.z * this.position.offset.x - this.angularVelocity.x * this.position.offset.z,
          0,
          -2 * this.angularVelocity.x * this.position.offset.x
        ],
        [
          -2 * this.angularVelocity.y * this.position.offset.x -
            this.angularVelocity.y * this.position.offset.z +
            this.angularVelocity.z * this.position.offset.x,
          2 * this.angularVelocity.x * this.position.offset.y,
          0
        ]
      ])
    }
  }

  get coriolisEffectJacobian() {
    return {
      wrtV: new Matrix([
        [0, -2 * this.angularVelocity.z, 2 * this.angularVelocity.y],
        [2 * this.angularVelocity.z, 0, -2 * this.angularVelocity.x],
        [-2 * this.angularVelocity.y, 2 * this.angularVelocity.x, 0]
      ]),
      wrtOmega: new Matrix([
        [-2 * this.velocity.z, 2 * this.velocity.y, 0],
        [2 * this.velocity.z, -2 * this.velocity.x, 0],
        [0, 2 * this.velocity.x, -2 * this.velocity.y]
      ])
    }
  }

  get zeroMatrix() {
    return Matrix.zero(this.dimension)
  }

  get identityMatrix() {
    return Matrix.identity(this.dimension)
  }

  get dtMatrix() {
    return Matrix.diagonal(this.dimension, this.deltaT)
  }

  get dt2Matrix() {
    return Matrix.diagonal(this.dimension, 0.5 * Math.pow(this.deltaT, 2))
  }

  // TODO: Double check that we haven't lost refinement in our core kinematics model per loss of more sophisticated coefficients
  get kinematicsMatrix() {
    return Matrix.block([
      [this.identityMatrix, this.dtMatrix, this.dt2Matrix, this.zeroMatrix],
      [this.zeroMatrix, this.identityMatrix, this.dtMatrix, this.zeroMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.identityMatrix, this.dtMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.zeroMatrix, this.identityMatrix]
    ])
  }

  get leverArmMatrix() {
    const paddedJacobianWrtAlpha = this.leverArmEffectJacobian.wrtAlpha.pad({ top: 0, left: 9 })
    const paddedJacobianWrtOmega = this.leverArmEffectJacobian.wrtOmega.pad({ top: 0, left: 6 })
    return paddedJacobianWrtAlpha.add(paddedJacobianWrtOmega)
  }

  get coriolisMatrix() {
    const paddedJacobianWrtV = this.coriolisEffectJacobian.wrtV.pad({ top: 0, left: 3 })
    const paddedJacobianWrtOmega = this.coriolisEffectJacobian.wrtOmega.pad({ top: 0, left: 6 })
    return paddedJacobianWrtV.add(paddedJacobianWrtOmega)
  }

  get stateTransitionMatrix() {
    return Matrix.block([
      [this.kinematicsMatrix, this.leverArmMatrix],
      [this.coriolisMatrix, this.kinematicsMatrix]
    ])
  }
}
