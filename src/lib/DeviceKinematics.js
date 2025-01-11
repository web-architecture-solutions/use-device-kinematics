import { toRadians, euclideanNorm, Matrix } from './math'

export class DeviceKinematics {
  constructor(sensorData, deltaT) {
    this.dimension = 3
    this.sensorData = sensorData
    this.position = sensorData.position
    this.linearAccelerationSensorData = sensorData.linearAcceleration
    this.angularVelocitySensorData = sensorData.angularVelocity
    this.orientationSensorData = sensorData.orientation
    this.deltaT = deltaT
  }

  static haversineDistance(
    { latitude, longitude, altitude },
    { latitude: previousLatitude, longitude: previousLongitude, altitude: previousAltitude }
  ) {
    const coordinates2D = [latitude, previousLatitude, longitude, previousLongitude]
    if (coordinates2D.some((coordinate) => coordinate === null)) {
      return { distance2D: null, distance3D: null, deltaLat: null, deltaLon: null, deltaAlt: null }
    }

    const R = 6371000

    const y = toRadians(latitude - previousLatitude)
    const x = toRadians(longitude - previousLongitude)
    const z = altitude - previousAltitude

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
      xyz: Math.sqrt(xy * xy + deltaAlt * deltaAlt)
    }
  }

  derivative(variable) {
    const { previous, ...current } = variable
    let entries
    if (variable === this.position) {
      const displacement = this.haversineDistance(current, previous)
      displacementToVelocity = ([component, value]) => [component, value / this.deltaT]
      entries = Object.entries(displacement).map(displacementToVelocity)
    } else {
      entries = Object.entries(current).map(([component, value]) => {
        const delta = value - previous.component
        return [component, delta / this.deltaT]
      })
    }
    return Object.fromEntries(entries)
  }

  get velocityFromPosition() {
    return this.derivative(this.position)
  }

  get linearAcceleration() {
    return {
      ...this.linearAccelerationSensorData,
      xy: euclideanNorm(this.linearAcceleration.x, this.linearAcceleration.y),
      xyz: euclideanNorm(this.linearAcceleration.x, this.linearAcceleration.y, this.linearAcceleration.z)
    }
  }

  get jerkFromAcceleration() {
    return this.derivative(this.linearAcceleration)
  }

  get angularVelocity() {
    return {
      ...this.angularVelocitySensorData,
      xy: euclideanNorm(toRadians(this.angularVelocity.beta), toRadians(this.angularVelocity.gamma)),
      xyz: euclideanNorm(toRadians(this.angularVelocity.alpha), toRadians(this.angularVelocity.beta), toRadians(this.angularVelocity.gamma))
    }
  }

  get angularAcceleration() {
    return this.derivative(this.angularVelocity)
  }

  get angularJerk() {
    return this.derivative(this.angularAcceleration)
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
