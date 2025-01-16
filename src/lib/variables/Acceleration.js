import Variable from './Variable'
import Jerk from './Jerk'

export default class Acceleration extends Variable {
  static name = 'acceleration'
  static derivativeConstructor = Jerk
  static initial = { x: null, y: null, z: null }
}
