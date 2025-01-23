import { big } from '../math'

import { calculateGeodeticDisplacement } from './formulae'

function calculatePositionDerivativeWrtT(position) {
  const geodeticDisplacement = calculateGeodeticDisplacement(position, position.previous)
  const deltaT = big * position.timestamp - big * position.previous.timestamp
  const calculateComponentDerivativeWrtT = (_, index) => {
    const delta = geodeticDisplacement[index]
    return delta / deltaT
  }
  return position.map(calculateComponentDerivativeWrtT)
}

const angularJerkSchema = {
  name: 'angularJerk'
}

const angularAccelerationSchema = {
  name: 'angularAcceleration',
  derivativeSchema: angularJerkSchema
}

const angularVelocitySchema = {
  name: 'angularVelocity',
  derivativeSchema: angularAccelerationSchema
}

const orientationSchema = {
  name: 'orientation'
}

const jerkSchema = {
  name: 'jerk'
}

const accelerationSchema = {
  name: 'acceleration',
  derivativeSchema: jerkSchema
}

const velocitySchema = {
  name: 'velocity'
}

const positionSchema = {
  name: 'position',
  derivativeSchema: velocitySchema,
  calculateDerivativeWrtT: calculatePositionDerivativeWrtT
}

const variableSchemata = {
  [angularJerkSchema.name]: angularJerkSchema,
  [angularAccelerationSchema.name]: angularAccelerationSchema,
  [angularVelocitySchema.name]: angularVelocitySchema,
  [orientationSchema.name]: orientationSchema,
  [jerkSchema.name]: jerkSchema,
  [accelerationSchema.name]: accelerationSchema,
  [velocitySchema.name]: velocitySchema,
  [positionSchema.name]: positionSchema
}

export default variableSchemata
