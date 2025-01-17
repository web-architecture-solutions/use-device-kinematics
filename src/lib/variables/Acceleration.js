import Variable from './Variable'
import Jerk from './Jerk'

import { VariableNames } from '../../use-sensor-data/constants'

export default class Acceleration extends Variable {
  static name = VariableNames.ACCELERATION
  static derivative = Jerk
  static initial = { x: null, y: null, z: null }
}
