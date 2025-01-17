import Variable from '../lib/Variable'

import Velocity from './Velocity'

import { haversineDistance } from '../lib/physics'

import { VariableNames } from '../constants'

export default class Position extends Variable {
  static name = VariableNames.POSITION
  static derivative = Velocity
  static initial = { latitude: null, longitude: null, altitude: null }
  static renameComponents = { latitude: 'y', longitude: 'x', altitude: 'z' }

  // NOTE: Must be an arrow function to maintain reference
  #initializeComponentDerivative = ([name, value]) => {
    const delta = value - this.previous[name]
    return [name, delta / this.deltaT]
  }

  #initializeDerivatives() {
    const derivativeWrtT = this.map(this.#initializeComponentDerivative)
    this.derivativeWrtT = this.constructor.derivative
      ? new this.derivative(derivativeWrtT, this.previousDerivativesWrtT, {}, this.constructor.derivative, this.sensorData)
      : {}
  }

  geodeticDisplacement(prevPosition, currentPosition) {
    const { x: lon1, y: lat1, z: alt1 } = prevPosition
    const { x: lon2, y: lat2, z: alt2 } = currentPosition

    const R = 6371000 // Earth's mean radius in meters

    const radLat1 = toRadians(lat1)
    const radLon1 = toRadians(lon1)
    const radLat2 = toRadians(lat2)
    const radLon2 = toRadians(lon2)

    const deltaLon = radLon2 - radLon1

    const x = R * Math.cos(radLat2) * deltaLon // Eastward displacement (meters)
    const y = R * (radLat2 - radLat1) // Northward displacement (meters)
    const z = alt2 - alt1 // Vertical displacement (meters)

    return { x, y, z }
  }

  // BUG: Re-implement post-refactor
  updateDerivativesWrtT(deltaT) {
    const isPreviousNonEmpty = Object.keys(this.previous) > 0
    if (isPreviousNonEmpty) {
      const displacement = haversineDistance(this, this.previous)
      const displacementToVelocity = ([component, delta]) => [component, delta / deltaT]
      this.derivativesWrtT = Object.fromEntries(Object.entries(displacement).map(displacementToVelocity))
    }
  }
}
