import Variable from './Variable'

export default class Orientation extends Variable {
  static name = 'orientation'
  static useRadians = true

  static get initial() {
    return {
      alpha: null,
      beta: null,
      gamma: null
    }
  }

  static get renameVariables() {
    return { alpha: 'yaw', beta: 'pitch', gamma: 'roll' }
  }
}
