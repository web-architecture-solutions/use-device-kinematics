import Variable from './Variable'
import AngularAcceleration from './AngularAcceleration'

import { VariableNames } from '../../use-sensor-data/constants'

export default class AngularVelocity extends Variable {
  static name = VariableNames.ANGULAR_VELOCITY
  static derivative = AngularAcceleration
  static initial = { alpha: null, beta: null, gamma: null }
  static renameComponents = { alpha: 'z', beta: 'x', gamma: 'y' }
  static useRadians = true
}
