import Variable from '../lib/Variable'

import AngularAcceleration from './AngularAcceleration'

import { Axis } from './constants'

export default class AngularVelocity extends Variable {
  static name = 'angularVelocity'
  static derivative = AngularAcceleration
  static initial = [null, null, null]
  static renameComponents = { alpha: Axis.z, beta: Axis.x, gamma: Axis.y }
  static useRadians = true
}
