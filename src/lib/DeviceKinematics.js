import { toRadians, euclideanNorm, Matrix } from './math'

export default class DeviceKinematics {
  constructor(_sensorData, _previousSensorData, deltaT) {
    const sensorData = DeviceKinematics.initializeSensorData(_sensorData, _previousSensorData)

    this.dimension = 3
    this.sensorData = sensorData
    this.positionSensorData = sensorData.position
    this.accelerationSensorData = sensorData.acceleration
    this.angularVelocitySensorData = sensorData.angularVelocity
    this.orientationSensorData = sensorData.orientation
    this.deltaT = deltaT
  }

  static initializeSensorData(_sensorData, _previousSensorData) {
    return Object.fromEntries(
      Object.keys(_sensorData).map((variableName) => [
        variableName,
        { ..._sensorData[variableName], previous: _previousSensorData?.[variableName] }
      ])
    )
  }

  haversineDistance(
    { latitude, longitude, altitude },
    { latitude: previousLatitude, longitude: previousLongitude, altitude: previousAltitude }
  ) {
    const coordinates2D = [latitude, previousLatitude, longitude, previousLongitude]

    if (coordinates2D.some((coordinate) => coordinate === null)) {
      return { x: null, y: null, z: null, xy: null, xyz: null }
    }

    const R = 6371000

    const y = toRadians(latitude - previousLatitude) // x === longitude
    const x = toRadians(longitude - previousLongitude) // y === latitude
    const z = altitude - previousAltitude // z === altitude

    const lat1 = toRadians(previousLatitude)
    const lat2 = toRadians(latitude)

    const a = Math.cos(lat1) * Math.cos(lat2) * Math.sin(x / 2) * Math.sin(x / 2)
    const b = Math.sin(y / 2) * Math.sin(y / 2) + a
    const c = 2 * Math.atan2(Math.sqrt(b), Math.sqrt(1 - b))

    const xy = c * R

    return {
      x: x * R * Math.cos((lat1 + lat2) / 2),
      y: y * R,
      z,
      xy: c * R,
      xyz: Math.sqrt(xy * xy + z * z)
    }
  }

  velocityFromPosition(current, previous) {
    const displacementToVelocity = ([component, value]) => [component, value / this.deltaT]
    const displacement = this.haversineDistance(current, previous)
    return Object.fromEntries(Object.entries(displacement).map(displacementToVelocity))
  }

  _derivativeWrtT(current, previous) {
    return Object.fromEntries(
      Object.entries(current).map(([component, value]) => {
        const delta = value - previous[component]
        return [component, delta / this.deltaT]
      })
    )
  }

  derivativeWrtT(variable) {
    const { previous, ...current } = variable
    if (current && previous) {
      return variable === this.position ? this.velocityFromPosition(current, previous) : this._derivativeWrtT(current, previous)
    }
    return null
  }

  get position() {
    return {
      x: this.positionSensorData.longitude, // x === longitude
      y: this.positionSensorData.latitude, // y === latitude
      z: this.positionSensorData.altitude, // z === altitude
      previous: {
        x: this.positionSensorData.previous?.longitude, // x === longitude
        y: this.positionSensorData.previous?.latitude, // y === latitude
        z: this.positionSensorData.previous?.altitude // z === altitude
      }
    }
  }

  get velocityFromPosition() {
    return this.derivativeWrtT(this.position)
  }

  get acceleration() {
    return {
      ...this.accelerationSensorData,
      xy: euclideanNorm(this.accelerationSensorData.x, this.accelerationSensorData.y),
      xyz: euclideanNorm(this.accelerationSensorData.x, this.accelerationSensorData.y, this.accelerationSensorData.z)
    }
  }

  get jerkFromAcceleration() {
    return this.derivativeWrtT(this.acceleration)
  }

  get orientation() {
    return {
      roll: this.orientationSensorData.gamma, // y === gamma === roll
      pitch: this.orientationSensorData.beta, // x === beta === pitch
      yaw: this.orientationSensorData.alpha // z === alpha === yaw
    }
  }

  get angularVelocity() {
    return {
      x: this.angularVelocitySensorData.beta, // x === beta === pitch
      y: this.angularVelocitySensorData.gamma, // y === gamma === roll
      z: this.angularVelocitySensorData.alpha, // z === alpha === yaw
      xy: euclideanNorm(toRadians(this.angularVelocitySensorData.beta), toRadians(this.angularVelocitySensorData.gamma)),
      xyz: euclideanNorm(
        toRadians(this.angularVelocitySensorData.alpha),
        toRadians(this.angularVelocitySensorData.beta),
        toRadians(this.angularVelocitySensorData.gamma)
      )
    }
  }

  get angularAccelerationFromVelocity() {
    return this.derivativeWrtT(this.angularVelocity)
  }

  get angularJerkFromAcceleration() {
    return this.derivativeWrtT(this.angularAccelerationFromVelocity)
  }

  get stateVector() {
    return {
      position: this.position,
      acceleration: this.acceleration,
      orientation: this.orientation,
      angularVelocity: this.angularVelocity,
      velocityFromPosition: this.velocityFromPosition
    }
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
