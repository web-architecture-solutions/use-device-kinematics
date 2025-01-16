import Variable from './Variable'

export default class Jerk extends Variable {
  static name = 'jerk'
  static components = ['x', 'y', 'z']
  static initial = { x: null, y: null, z: null }
}
