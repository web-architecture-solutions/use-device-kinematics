import { Position, Velocity, Acceleration, Jerk, Orientation, AngularVelocity, AngularAcceleration, AngularJerk } from './variables'

export const VariableNames = {
  POSITION: Position.name,
  VELOCITY: Velocity.name,
  ACCELERATION: Acceleration.name,
  JERK: Jerk.name,
  ORIENTATION: Orientation.name,
  ANGULAR_VELOCITY: AngularVelocity.name,
  ANGULAR_ACCELERATION: AngularAcceleration.name,
  ANGULAR_JERK: AngularJerk.name
}

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
