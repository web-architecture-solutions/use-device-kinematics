import Variable from './Variable'
import Jerk from './Jerk'

export default class Acceleration extends Variable {
  static name = 'acceleration'
  static derivative = Jerk
  static initial = { x: null, y: null, z: null }
}
