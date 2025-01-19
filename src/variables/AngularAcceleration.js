import Variable from '../lib/Variable'

import AngularJerk from './AngularJerk'

export default class AngularAcceleration extends Variable {
  static name = 'angularAcceleration'
  static derivative = AngularJerk
}
