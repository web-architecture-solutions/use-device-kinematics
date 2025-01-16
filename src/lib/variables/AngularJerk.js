import Variable from './Variable'

export default class AngularJerk extends Variable {
  static name = 'angularJerk'
  static components = ['x', 'y', 'z']
  static initial = { x: null, y: null, z: null }
}
