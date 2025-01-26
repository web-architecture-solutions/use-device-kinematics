import IIRFVariable from '../hooks/use-iirf-data/lib/IIRFVariable'

import { S } from './math'

import { calculateGeodeticDisplacement } from './physics/formulae'

import { VariableNames } from './constants'

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
  name: VariableNames.ANGULAR_JERK
}

const angularAccelerationSchema = {
  name: VariableNames.ANGULAR_ACCELERATION,
  derivativeSchema: angularJerkSchema
}

const angularVelocitySchema = {
  name: VariableNames.ANGULAR_VELOCITY,
  derivativeSchema: angularAccelerationSchema
}

const orientationSchema = {
  name: VariableNames.ORIENTATION
}

const jerkSchema = {
  name: VariableNames.JERK
}

const accelerationSchema = {
  name: VariableNames.ACCELERATION,
  derivativeSchema: jerkSchema
}

const velocitySchema = {
  name: VariableNames.VELOCITY
}

const positionSchema = {
  name: VariableNames.POSITION,
  derivativeSchema: velocitySchema,
  calculateDerivativeWrtT: calculatePositionDerivativeWrtT
}

const variableSchemata = {
  [VariableNames.ANGULAR_JERK]: angularJerkSchema,
  [VariableNames.ANGULAR_ACCELERATION]: angularAccelerationSchema,
  [VariableNames.ANGULAR_VELOCITY]: angularVelocitySchema,
  [VariableNames.ORIENTATION]: orientationSchema,
  [VariableNames.JERK]: jerkSchema,
  [VariableNames.ACCELERATION]: accelerationSchema,
  [VariableNames.VELOCITY]: velocitySchema,
  [VariableNames.POSITION]: positionSchema
}

export default variableSchemata
