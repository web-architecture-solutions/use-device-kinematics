import Variable from './Variable'

export default class Orientation extends Variable {
  static name = 'orientation'
  static components = ['yaw', 'pitch', 'roll']
  static initial = { alpha: null, beta: null, gamma: null }
  static renameComponents = { alpha: 'yaw', beta: 'pitch', gamma: 'roll' }
  static useRadians = true
}
