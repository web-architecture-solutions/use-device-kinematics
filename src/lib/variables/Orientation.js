import Variable from './Variable'

export default class Orientation extends Variable {
  static name = 'orientation'
  static derivativeName = 'angularVelocityFromOrientation'
  static useRadians = true

  static get initial() {
    return {
      alpha: null,
      beta: null,
      gamma: null
    }
  }

  static get renameComponent() {
    return { alpha: 'yaw', beta: 'pitch', gamma: 'roll' }
  }
}
