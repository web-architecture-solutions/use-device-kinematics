import Variable from './Variable'
import AngularAcceleration from './AngularAcceleration'

export default class AngularVelocity extends Variable {
  static name = 'angularVelocity'
  static derivative = AngularAcceleration
  static initial = { alpha: null, beta: null, gamma: null }
  static renameComponents = { alpha: 'z', beta: 'x', gamma: 'y' }
  static useRadians = true
}
