import Variable from '../lib/Variable'

import AngularAcceleration from './AngularAcceleration'

import { Dimension, VariableNames } from '../constants'

export default class AngularVelocity extends Variable {
  static name = VariableNames.ANGULAR_VELOCITY
  static derivative = AngularAcceleration
  static initial = [null, null, null]
  static renameComponents = { alpha: Dimension.z, beta: Dimension.x, gamma: Dimension.y }
  static useRadians = true
}
