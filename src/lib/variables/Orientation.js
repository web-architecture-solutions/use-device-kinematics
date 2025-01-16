import Variable from './Variable'

export default class Orientation extends Variable {
  static name = 'orientation'
  static derivativeName = 'angularVelocity'
  static useRadians = true
  static components = ['yaw', 'pitch', 'roll']

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
