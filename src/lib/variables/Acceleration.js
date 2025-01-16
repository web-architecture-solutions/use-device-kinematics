import Variable from './Variable'

export default class Acceleration extends Variable {
  static name = 'acceleration'
  static derivativeName = 'jerk'
  static components = ['x', 'y', 'z']

  static get initial() {
    return {
      x: null,
      y: null,
      z: null
    }
  }
}
