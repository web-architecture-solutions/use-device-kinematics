import Variable from './Variable'

export default class Acceleration extends Variable {
  static get name() {
    return 'acceleration'
  }

  static get initial() {
    return {
      x: null,
      y: null,
      z: null
    }
  }
}
