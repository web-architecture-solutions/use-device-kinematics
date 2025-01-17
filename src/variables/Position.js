import Variable from '../lib/Variable'

import Velocity from './Velocity'

import { VariableNames } from '../constants'

class GeodeticDisplacement {
  static R = 6371000

  constructor(currentPosition, previousPosition) {
    this.currentPosition = currentPosition
    this.previousPosition = previousPosition
  }

  get x() {
    const { x: lon2, y: lat2 } = this.currentPosition
    const { x: lon1 } = this.previousPosition

    const radLon1 = toRadians(lon1)
    const radLat2 = toRadians(lat2)
    const radLon2 = toRadians(lon2)

    const deltaLon = radLon2 - radLon1

    return GeodeticDisplacement.R * Math.cos(radLat2) * deltaLon
  }

  get y() {
    const { y: lat2 } = this.currentPosition
    const { y: lat1 } = this.previousPosition

    const radLat1 = toRadians(lat1)
    const radLat2 = toRadians(lat2)

    return GeodeticDisplacement.R * (radLat2 - radLat1)
  }

  get z() {
    const { z: alt2 } = this.currentPosition
    const { z: alt1 } = this.previousPosition

    return alt2 - alt1
  }
}

export default class Position extends Variable {
  static name = VariableNames.POSITION
  static derivative = Velocity
  static initial = { latitude: null, longitude: null, altitude: null }
  static renameComponents = { latitude: 'y', longitude: 'x', altitude: 'z' }

  static componentDerivativeFactory(previous, deltaT) {
    return ([name, value]) => {
      const geodeticDisplacement = new GeodeticDisplacement()
      const delta = value - previous[name]
      return [name, delta / deltaT]
    }
  }
}
