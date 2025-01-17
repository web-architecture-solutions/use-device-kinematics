import Variable from '../lib/Variable'

import Velocity from './Velocity'

import { VariableNames } from '../constants'

import { calculateGeodeticDisplacement } from '../lib/physics'

export default class Position extends Variable {
  static name = VariableNames.POSITION
  static derivative = Velocity
  static initial = { latitude: null, longitude: null, altitude: null }
  static renameComponents = { latitude: 'y', longitude: 'x', altitude: 'z' }

  static calculateDerivativeWrtT(position, deltaT) {
    const geodeticDisplacement = calculateGeodeticDisplacement(position, position.previous)
    const initializeComponentDerivative = ([name]) => {
      const delta = geodeticDisplacement[name]
      return [name, delta / deltaT]
    }
    return position.map(initializeComponentDerivative)
  }
}
