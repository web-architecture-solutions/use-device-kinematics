import Variable from './Variable'
import AngularAcceleration from './AngularAcceleration'

export default class AngularVelocity extends Variable {
  static name = 'angularVelocity'
  static derivativeName = 'angularAcceleration'
  static derivativeConstructor = AngularAcceleration
  static components = ['x', 'y', 'z']
  static initial = { alpha: null, beta: null, gamma: null }
  static renameComponents = { alpha: 'z', beta: 'x', gamma: 'y' }
  static useRadians = true
}
