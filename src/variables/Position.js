import Variable from '../lib/Variable'

import Velocity from './Velocity'

import { Axis } from './constants'

import { calculateGeodeticDisplacement } from '../lib/physics'

export default class Position extends Variable {
  static name = 'position'
  static derivative = Velocity
  static initial = [null, null, null]
  static renameComponents = { latitude: Axis.y, longitude: Axis.x, altitude: Axis.z }

  static calculateDerivativeWrtT(position, deltaT) {
    const geodeticDisplacement = calculateGeodeticDisplacement(position, position.previous)
    const initializeComponentDerivative = (_, index) => {
      const delta = geodeticDisplacement[index]
      return delta / deltaT
    }
    return position.map?.(initializeComponentDerivative)
  }
}
