import Variable from '../lib/Variable'

import AngularAcceleration from './AngularAcceleration'

import { VariableNames } from '../constants'

export default class AngularVelocity extends Variable {
  static name = VariableNames.ANGULAR_VELOCITY
  static derivative = AngularAcceleration
  static initial = { alpha: null, beta: null, gamma: null }
  static renameComponents = { alpha: 'z', beta: 'x', gamma: 'y' }
  static useRadians = true
}
