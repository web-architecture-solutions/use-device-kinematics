import { toRadians } from './math'

export function calculateGeodeticDisplacement(currentPosition, previousPosition) {
  const { x: previousLongitude, y: previousLatitude, z: previousAltitude } = previousPosition
  const { x: currentLongitude, y: currentLatitude, z: currentAltitude } = currentPosition

  const earthRadius = 6371000

  const previousLatitudeRadians = toRadians(previousLatitude)
  const previousLongitudeRadians = toRadians(previousLongitude)
  const currentLatitudeRadians = toRadians(currentLatitude)
  const currentLongitudeRadians = toRadians(currentLongitude)

  const longitudeDifferenceRadians = currentLongitudeRadians - previousLongitudeRadians

  const eastwardDisplacement = earthRadius * Math.cos(currentLatitudeRadians) * longitudeDifferenceRadians
  const northwardDisplacement = earthRadius * (currentLatitudeRadians - previousLatitudeRadians)
  const verticalDisplacement = currentAltitude - previousAltitude

  return {
    x: eastwardDisplacement,
    y: northwardDisplacement,
    z: verticalDisplacement
  }
}

export function calculateHaversineDistance(previousPosition, currentPosition) {
  const { x: previousLongitude, y: previousLatitude } = previousPosition
  const { x: currentLongitude, y: currentLatitude } = currentPosition

  const earthRadius = 6371000

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

  return earthRadius * centralAngle
}
