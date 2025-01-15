import Variable from './Variable'

import { haversineDistance } from '../physics'

export default class Position extends Variable {
  static name = 'position'
  static derivativeName = 'velocityFromPosition'

  static get initial() {
    return {
      latitude: null,
      longitude: null,
      altitude: null
    }
  }

  static get renameComponent() {
    return { latitude: 'y', longitude: 'x', altitude: 'z' }
  }

  updateDerivativesWrtT(deltaT) {
    const isPreviousNonEmpty = Object.keys(this.previous) > 0
    if (isPreviousNonEmpty) {
      const displacement = haversineDistance(this, this.previous)
      const displacementToVelocity = ([component, delta]) => [component, delta / deltaT]
      this.derivativesWrtT = Object.fromEntries(Object.entries(displacement).map(displacementToVelocity))
    }
  }
}
