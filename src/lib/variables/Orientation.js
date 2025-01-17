import Variable from './Variable'

import { VariableNames } from '../../use-sensor-data/constants'

export default class Orientation extends Variable {
  static name = VariableNames.ORIENTATION
  static initial = { alpha: null, beta: null, gamma: null }
  static renameComponents = { alpha: 'z', beta: 'x', gamma: 'y' }
  static useRadians = true
}
