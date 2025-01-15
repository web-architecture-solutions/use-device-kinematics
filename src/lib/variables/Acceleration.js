import Variable from './Variable'

export default class Acceleration extends Variable {
  static name = 'acceleration'

  static get initial() {
    return {
      x: null,
      y: null,
      z: null
    }
  }
}
