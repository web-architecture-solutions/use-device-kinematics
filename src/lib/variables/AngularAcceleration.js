import Variable from './Variable'
import AngularJerk from './AngularJerk'

import { VariableNames } from './constants'

export default class AngularAcceleration extends Variable {
  static name = VariableNames.ANGULAR_ACCELERATION
  static derivative = AngularJerk
  static initial = { x: null, y: null, z: null }
}
