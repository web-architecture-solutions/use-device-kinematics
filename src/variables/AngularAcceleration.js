import Variable from '../lib/Variable'

import AngularJerk from './AngularJerk'

import { VariableNames } from '../constants'

export default class AngularAcceleration extends Variable {
  static name = VariableNames.ANGULAR_ACCELERATION
  static derivative = AngularJerk
}
