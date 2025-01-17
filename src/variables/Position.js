import Variable from '../lib/Variable'

import Velocity from './Velocity'

import { VariableNames } from '../constants'

import { calculateGeodeticDisplacement } from '../lib/physics'

export default class Position extends Variable {
  static name = VariableNames.POSITION
  static derivative = Velocity
  static initial = { latitude: null, longitude: null, altitude: null }
  static renameComponents = { latitude: 'y', longitude: 'x', altitude: 'z' }

  static derivativeFactory(position, deltaT, derivativeConstructor, previousDerivativesWrtT, sensorData) {
    const geodeticDisplacement = calculateGeodeticDisplacement(position, position.previous)
    const initializeComponentDerivative = ([name]) => {
      const delta = geodeticDisplacement[name]
      return [name, delta / deltaT]
    }
    const derivativeWrtT = position.map(initializeComponentDerivative)
    return derivativeConstructor
      ? new derivativeConstructor(derivativeWrtT, previousDerivativesWrtT, {}, derivativeConstructor, sensorData)
      : {}
  }
}
