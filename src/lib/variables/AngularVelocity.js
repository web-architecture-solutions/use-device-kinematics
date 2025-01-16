import Variable from './Variable'

export default class AngularVelocity extends Variable {
  static name = 'angularVelocity'
  static useRadians = true
  static derivativeName = 'angularAcceleration'
  static components = ['x', 'y', 'z']

  static get initial() {
    return {
      alpha: null,
      beta: null,
      gamma: null
    }
  }

  static get renameComponent() {
    return { alpha: 'z', beta: 'x', gamma: 'y' }
  }
}
