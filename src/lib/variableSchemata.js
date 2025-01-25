import IIRFVariable from '../hooks/use-iirf-data/lib/IIRFVariable'

import { S } from './math'

import { calculateGeodeticDisplacement } from './physics/formulae'

function calculatePositionDerivativeWrtT(position) {
  if (position.previous) {
    const geodeticDisplacement = calculateGeodeticDisplacement(position, position.previous)
    const calculateComponentDerivativeWrtT = (_, index) => {
      const delta = geodeticDisplacement[index]
      return delta / (S * position.deltaT)
    }
    return new IIRFVariable(
      position.map(calculateComponentDerivativeWrtT),
      position.previous?.derivativeWrtT,
      position.schema,
      position.deltaT
    )
  }
  return IIRFVariable.initial
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
