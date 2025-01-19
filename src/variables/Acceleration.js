import Variable from '../lib/Variable'

import Jerk from './Jerk'

export default class Acceleration extends Variable {
  static name = 'acceleration'
  static derivative = Jerk
  static initial = [null, null, null]
}
