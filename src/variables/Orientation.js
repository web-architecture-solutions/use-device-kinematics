import Variable from '../lib/Variable'

import { Dimension, VariableNames } from '../constants'

export default class Orientation extends Variable {
  static name = VariableNames.ORIENTATION
  static initial = { alpha: null, beta: null, gamma: null }
  static renameComponents = { alpha: Dimension.z, beta: Dimension.x, gamma: Dimension.y }
  static useRadians = true
}
