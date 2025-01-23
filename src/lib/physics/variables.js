import Variable from './Variable'

import { DifferentiationFilter } from '../math'

import { correctGeodeticPosition } from './formulae'

export class AngularJerk extends Variable {
  static name = 'angularJerk'
}

export class AngularAcceleration extends Variable {
  static name = 'angularAcceleration'
  static derivative = AngularJerk
}

export class AngularVelocity extends Variable {
  static name = 'angularVelocity'
  static derivative = AngularAcceleration
}

export class Orientation extends Variable {
  static name = 'orientation'
}

export class Jerk extends Variable {
  static name = 'jerk'
}

export class Acceleration extends Variable {
  static name = 'acceleration'
  static derivative = Jerk
}

export class Velocity extends Variable {
  static name = 'velocity'
}

export class Position extends Variable {
  static name = 'position'
  static derivative = Velocity

  static calculateDerivativeWrtT(position) {
    const feedforward = [1, -1]
    const feedback = [1, -1]
    const sampleRate = 44100
    const differentiationFilter = new DifferentiationFilter(feedforward, feedback, sampleRate)
    const correctedGeodeticPosition = correctGeodeticPosition(position, position.previous, true)
    const initializeComponentDerivative = ({ current, previous }) => {
      return differentiationFilter.calculate(current, previous)
    }
    return correctedGeodeticPosition.map(initializeComponentDerivative)
  }
}
