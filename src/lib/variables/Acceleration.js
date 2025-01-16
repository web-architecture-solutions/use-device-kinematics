import Variable from './Variable'
import Jerk from './Jerk'

export default class Acceleration extends Variable {
  static name = 'acceleration'
  static derivativeName = 'jerk'
  static derivativeConstructor = Jerk
  static components = ['x', 'y', 'z']
  static initial = { x: null, y: null, z: null }
}
