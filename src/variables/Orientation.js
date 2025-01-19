import Variable from '../lib/Variable'

import { Axis } from './constants'

export default class Orientation extends Variable {
  static name = 'orientation'
  static initial = [null, null, null]
  static renameComponents = { alpha: Axis.z, beta: Axis.x, gamma: Axis.y }
  static useRadians = true
}
