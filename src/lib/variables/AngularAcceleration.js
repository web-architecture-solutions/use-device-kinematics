import Variable from './Variable'
import AngularJerk from './AngularJerk'

export default class AngularAcceleration extends Variable {
  static name = 'angularAcceleration'
  static derivativeName = 'angularJerk'
  static derivativeConstructor = AngularJerk
  static components = ['x', 'y', 'z']
  static initial = { x: null, y: null, z: null }
}
