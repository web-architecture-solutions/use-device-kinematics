import Variable from './Variable'

export default class Orientation extends Variable {
  static name = 'orientation'
  static initial = { alpha: null, beta: null, gamma: null }
  static renameComponents = { alpha: 'z', beta: 'x', gamma: 'y' }
  static useRadians = true
}
