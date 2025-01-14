import Variable from './Variable'

export default class Position extends Variable {
  derivativesWrtT(deltaT) {
    const displacement = haversineDistance(this, this.previous)
    const displacementToVelocity = ([component, delta]) => [component, delta / deltaT]
    return new Variable(Object.fromEntries(Object.entries(displacement).map(displacementToVelocity)))
  }
}
