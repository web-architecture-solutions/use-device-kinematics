import { big } from '../math'

import { calculateGeodeticDisplacement } from './formulae'

export const AngularJerk = {
  name: 'angularJerk'
}

export const AngularAcceleration = {
  name: 'angularAcceleration',
  derivative: AngularJerk
}

export const AngularVelocity = {
  name: 'angularVelocity',
  derivative: AngularAcceleration
}

export const Orientation = {
  name: 'orientation'
}

export const Jerk = {
  name: 'jerk'
}

export const Acceleration = {
  name: 'acceleration',
  derivative: Jerk
}

export const Velocity = {
  name: 'velocity'
}

export const Position = {
  name: 'position',
  derivative: Velocity,
  calculateDerivativeWrtT: (position) => {
    const geodeticDisplacement = calculateGeodeticDisplacement(position, position.previous)

    const deltaT = big * position.timestamp - big * position.previous.timestamp
    const calculateComponentDerivativeWrtT = (_, index) => {
      const delta = geodeticDisplacement[index]
      return delta / deltaT
    }
    return position.map(calculateComponentDerivativeWrtT)
  }
}
