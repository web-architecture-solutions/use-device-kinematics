import Variable from './Variable'
import AngularJerk from './AngularJerk'

export default class AngularAcceleration extends Variable {
  static name = 'angularAcceleration'
  static derivativeConstructor = AngularJerk
  static initial = { x: null, y: null, z: null }
}
