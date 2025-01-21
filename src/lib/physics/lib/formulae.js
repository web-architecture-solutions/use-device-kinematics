import { toRadians } from '../../math'

const R_E = 6371000

export function calculateGeodeticDisplacement(currentPosition, previousPosition) {
  const [previousLongitude, previousLatitude, previousAltitude] = previousPosition
  const [currentLongitude, currentLatitude, currentAltitude] = currentPosition

  const previousLatitudeRadians = toRadians(previousLatitude)
  const previousLongitudeRadians = toRadians(previousLongitude)
  const currentLatitudeRadians = toRadians(currentLatitude)
  const currentLongitudeRadians = toRadians(currentLongitude)

  const longitudeDifferenceRadians = currentLongitudeRadians - previousLongitudeRadians

  const eastwardDisplacement = R_E * Math.cos(currentLatitudeRadians) * longitudeDifferenceRadians
  const northwardDisplacement = R_E * (currentLatitudeRadians - previousLatitudeRadians)
  const verticalDisplacement = currentAltitude - previousAltitude

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
