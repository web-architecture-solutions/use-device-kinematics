import Position from '../lib/variables/Position'
import Acceleration from '../lib/variables/Acceleration'
import Orientation from '../lib/variables/Orientation'
import AngularVelocity from '../lib/variables/AngularVelocity'

export const VariableNames = {
  POSITION: 'position',
  ACCELERATION: 'acceleration',
  ORIENTATION: 'orientation',
  ANGULAR_VELOCITY: 'angularVelocity'
}

export const VariableConstructors = {
  [VariableNames.POSITION]: Position,
  [VariableNames.ACCELERATION]: Acceleration,
  [VariableNames.ORIENTATION]: Orientation,
  [VariableNames.ANGULAR_VELOCITY]: AngularVelocity
}
