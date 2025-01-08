const toRadians = (degrees) => degrees * (Math.PI / 180)

export function calculateHaversineDistance(p1, p2) {
  const R = 6371000
  if (!p1 || !p2) return null

  const deltaLat = toRadians(p2.latitude - p1.latitude)
  const deltaLon = toRadians(p2.longitude - p1.longitude)

  const lat1 = toRadians(p1.latitude)
  const lat2 = toRadians(p2.latitude)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function calculateVelocityFromPosition(p1, p2, timeInterval) {
  const distance = calculateHaversineDistance(p1, p2)
  return distance / timeInterval
}

export function calculateTotalAcceleration(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}

export function calculateJerk(acceleration1, acceleration2, timeInterval) {
  return (acceleration2 - acceleration1) / timeInterval
}

export function calculateTotalAngularVelocity(alpha, beta) {
  return Math.sqrt(Math.pow(alpha * (Math.PI / 180), 2) + Math.pow(beta * (Math.PI / 180), 2))
}

export function calculateCurvatureFromAngularVelocity(angularVelocity, velocity) {
  return angularVelocity / velocity
}

export function calculateCurvatureFromAcceleration(acceleration, velocity) {
  return acceleration / Math.pow(velocity, 2)
}
