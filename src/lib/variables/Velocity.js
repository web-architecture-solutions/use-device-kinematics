import Variable from './Variable'

export default class Velocity extends Variable {
  static name = 'velocity'
  static components = ['x', 'y', 'z']
  static initial = { x: null, y: null, z: null }
}
