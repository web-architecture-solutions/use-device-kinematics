import Variable from './Variable'

export default class Acceleration extends Variable {
  static name = 'acceleration'
  static derivativeName = 'jerkFromAcceleration'
  static components = ['x', 'y', 'z']

  static get initial() {
    return {
      x: null,
      y: null,
      z: null
    }
  }
}
