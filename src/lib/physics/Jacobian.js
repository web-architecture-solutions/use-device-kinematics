import { PartialDerivative } from './constants'

import { Matrix } from '../math'

export default class Jacobian {
  static coriolisEffect(angularVelocity, velocity) {
    return {
      [PartialDerivative.WRT_V]: new Matrix([
        [0, -2 * angularVelocity.z, 2 * angularVelocity.y],
        [2 * angularVelocity.z, 0, -2 * angularVelocity.x],
        [-2 * angularVelocity.y, 2 * angularVelocity.x, 0]
      ]),
      [PartialDerivative.WRT_OMEGA]: new Matrix([
        [-2 * velocity.z, 2 * velocity.y, 0],
        [2 * velocity.z, -2 * velocity.x, 0],
        [0, 2 * velocity.x, -2 * velocity.y]
      ])
    }
  }

  static leverArmEffect(offset, angularVelocity) {
    return {
      [PartialDerivative.WRT_ALPHA]: new Matrix([
        [0, -offset.z, offset.y],
        [offset.z, 0, -offset.x],
        [-offset.y, offset.x, 0]
      ]),
      [PartialDerivative.WRT_OMEGA]: new Matrix([
        [
          0,
          -2 * angularVelocity.z * offset.z,
          2 * angularVelocity.y * offset.y + angularVelocity.y * offset.z - angularVelocity.z * offset.x
        ],
        [2 * angularVelocity.z * offset.x - angularVelocity.x * offset.z, 0, -2 * angularVelocity.x * offset.x],
        [
          -2 * angularVelocity.y * offset.x - angularVelocity.y * offset.z + angularVelocity.z * offset.x,
          2 * angularVelocity.x * offset.y,
          0
        ]
      ])
    }
  }
}
