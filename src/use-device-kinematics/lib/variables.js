import { Variable, calculateGeodeticDisplacement } from '../../physics'

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

  static calculateDerivativeWrtT(position, deltaT) {
    const geodeticDisplacement = calculateGeodeticDisplacement(position, position.previous)
    const initializeComponentDerivative = (_, index) => {
      const delta = geodeticDisplacement[index]
      return delta / deltaT
    }
    return position.map(initializeComponentDerivative)
  }
}
