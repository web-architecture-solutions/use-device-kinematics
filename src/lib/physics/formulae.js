import { toRadians, S } from '../math'

import { R_E } from './constants'

export function calculateGeodeticDisplacement(currentPosition, previousPosition) {
  const [previousLongitude, previousLatitude, previousAltitude] = previousPosition
  const [currentLongitude, currentLatitude, currentAltitude] = currentPosition

  const previousLatitudeRadians = toRadians(previousLatitude)
  const previousLongitudeRadians = toRadians(previousLongitude)
  const currentLatitudeRadians = toRadians(currentLatitude)
  const currentLongitudeRadians = toRadians(currentLongitude)

  const longitudeDifferenceRadians = S * currentLongitudeRadians - S * previousLongitudeRadians

  const eastwardDisplacement = R_E * Math.cos(currentLatitudeRadians) * longitudeDifferenceRadians
  const northwardDisplacement = R_E * (S * currentLatitudeRadians - S * previousLatitudeRadians)
  const verticalDisplacement = S * currentAltitude - S * previousAltitude

  return [eastwardDisplacement, northwardDisplacement, verticalDisplacement]
}
