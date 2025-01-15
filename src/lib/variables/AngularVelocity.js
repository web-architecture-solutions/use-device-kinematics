import Variable from './Variable'

export default class AngularVelocity extends Variable {
  static name = 'acceleration'
  static useRadians = true

  static get initial() {
    return {
      alpha: null,
      beta: null,
      gamma: null
    }
  }

  static get renameVariables() {
    return { alpha: 'z', beta: 'x', gamma: 'y' }
  }
}
