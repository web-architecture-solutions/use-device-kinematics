import { toRadians } from '../math'

import { R_E } from './constants'

export function calculateGeodeticDisplacement(currentPosition, previousPosition, useBig = false) {
  const [previousLongitude, previousLatitude, previousAltitude] = previousPosition
  const [currentLongitude, currentLatitude, currentAltitude] = currentPosition

  const previousLatitudeRadians = toRadians(previousLatitude)
  const previousLongitudeRadians = toRadians(previousLongitude)
  const currentLatitudeRadians = toRadians(currentLatitude)
  const currentLongitudeRadians = toRadians(currentLongitude)

  const longitudeDifferenceRadians = useBig
    ? big * currentLongitudeRadians - big * previousLongitudeRadians
    : currentLongitudeRadians - previousLongitudeRadians

  const eastwardDisplacement = R_E * Math.cos(currentLatitudeRadians) * longitudeDifferenceRadians
  const northwardDisplacement =
    R_E * (useBig ? big * currentLatitudeRadians - big * previousLatitudeRadians : currentLatitudeRadians - previousLatitudeRadians)
  const verticalDisplacement = useBig ? big * currentAltitude - big * previousAltitude : currentAltitude - previousAltitude

  return [eastwardDisplacement, northwardDisplacement, verticalDisplacement]
}

/*
export function calculateHaversineDistance(previousPosition, currentPosition) {
  const { x: previousLongitude, y: previousLatitude } = previousPosition
  const { x: currentLongitude, y: currentLatitude } = currentPosition

  const previousLatitudeRadians = toRadians(previousLatitude)
  const currentLatitudeRadians = toRadians(currentLatitude)
  const latitudeDifferenceRadians = toRadians(currentLatitude - previousLatitude)
  const longitudeDifferenceRadians = toRadians(currentLongitude - previousLongitude)

  const a =
    Math.sin(latitudeDifferenceRadians / 2) * Math.sin(latitudeDifferenceRadians / 2) +
    Math.cos(previousLatitudeRadians) *
      Math.cos(currentLatitudeRadians) *
      Math.sin(longitudeDifferenceRadians / 2) *
      Math.sin(longitudeDifferenceRadians / 2)
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R_E * centralAngle
}
*/
