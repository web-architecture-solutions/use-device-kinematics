import Variable from './Variable'

export default class Position extends Variable {
  static get name() {
    return 'orientation'
  }

  static get initial() {
    return {
      alpha: null,
      beta: null,
      gamma: null
    }
  }
}
