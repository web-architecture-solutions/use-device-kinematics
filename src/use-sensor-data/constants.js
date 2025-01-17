import Position from '../variables/Position'
import Acceleration from '../variables/Acceleration'
import Orientation from '../variables/Orientation'
import AngularVelocity from '../variables/AngularVelocity'
import Velocity from '../variables/Velocity'
import Jerk from '../variables/Jerk'
import AngularAcceleration from '../variables/AngularAcceleration'
import AngularJerk from '../variables/AngularJerk'

import { VariableNames } from '../constants'

export const VariableConstructors = {
  [VariableNames.POSITION]: Position,
  [VariableNames.VELOCITY]: Velocity,
  [VariableNames.ACCELERATION]: Acceleration,
  [VariableNames.JERK]: Jerk,
  [VariableNames.ORIENTATION]: Orientation,
  [VariableNames.ANGULAR_VELOCITY]: AngularVelocity,
  [VariableNames.ANGULAR_ACCELERATION]: AngularAcceleration,
  [VariableNames.ANGULAR_JERK]: AngularJerk
}
