const R = 6371000

const toRadians = (degrees) => degrees * (Math.PI / 180)

export function calculateHaversineDistance(p1, p2) {
  if (!p1 || !p2) return null
  const deltaLat = toRadians(p2.latitude - p1.latitude)
  const deltaLon = toRadians(p2.longitude - p1.longitude)
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(p1.latitude)) * Math.cos(toRadians(p2.latitude)) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function calculateVelocityFromPosition(p1, p2, timeInterval) {
  const distance = calculateHaversineDistance(p1, p2)
  return distance / timeInterval
}

export function calculateTotalAcceleration(x, y, z) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))
}

export function calculateJerk(acceleration1, acceleration2, timeInterval) {
  return (acceleration2 - acceleration1) / timeInterval
}

export function calculateTotalAngularVelocity(latitude1, latitude2, timeInterval) {
  const deltaLat = toRadians(latitude2 - latitude1)
  return deltaLat / timeInterval
}

export function calculateCurvatureFromAngularVelocity(angularVelocity, velocity) {
  return angularVelocity / velocity
}

export function calculateCurvatureFromAcceleration(acceleration, velocity) {
  return acceleration / Math.pow(velocity, 2)
}
