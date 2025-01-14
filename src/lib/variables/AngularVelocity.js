import Variable from './Variable'

export default class AngularVelocity extends Variable {
  static get name() {
    return 'acceleration'
  }

  static get initial() {
    return {
      alpha: null,
      beta: null,
      gamma: null
    }
  }
}
