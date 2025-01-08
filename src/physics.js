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

  return {
    distance: c * R,
    deltaLat: deltaLat * R,
    deltaLon: deltaLon * R
  }
}

export function calculateTotalVelocity(p1, p2, timeInterval) {
  const distance = calculateHaversineDistance(p1, p2)
  return distance / timeInterval
}

export function calculateTotalAcceleration(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}

export function calculateTotalJerk(totalAcceleration1, totalAcceleration2, timeInterval) {
  return (totalAcceleration1 - totalAcceleration2) / timeInterval
}

export function calculateTotalAngularVelocity(alpha, beta) {
  return Math.sqrt(Math.pow(alpha * (Math.PI / 180), 2) + Math.pow(beta * (Math.PI / 180), 2))
}

export function calculateTotalCurvatureFromAcceleration(totalAcceleration, totalVelocity) {
  return totalAcceleration / Math.pow(totalVelocity, 2)
}

export function calculateTotalCurvatureFromAngularVelocity(totalAngularVelocity, totalVelocity) {
  return totalAngularVelocity / totalVelocity
}

export function calculateVelocityComponents(p1, p2, timeInterval) {
  const { deltaLat, deltaLon } = calculateHaversineDistance(p1, p2)

  const xVelocity = deltaLon / timeInterval
  const yVelocity = deltaLat / timeInterval

  return { xVelocity, yVelocity }
}

export function calculateAccelerationComponents(velocity1, velocity2, timeInterval) {
  const xAcceleration = (velocity2.xVelocity - velocity1.xVelocity) / timeInterval
  const yAcceleration = (velocity2.yVelocity - velocity1.yVelocity) / timeInterval

  return { xAcceleration, yAcceleration }
}

export function calculateJerkComponents(acceleration1, acceleration2, timeInterval) {
  const xJerk = (acceleration2.xAcceleration - acceleration1.xAcceleration) / timeInterval
  const yJerk = (acceleration2.yAcceleration - acceleration1.yAcceleration) / timeInterval

  return { xJerk, yJerk }
}

export function calculateAngularVelocityComponents(alpha, beta) {
  const xAngularVelocity = alpha * (Math.PI / 180) // Convert to radians
  const yAngularVelocity = beta * (Math.PI / 180) // Convert to radians

  return { xAngularVelocity, yAngularVelocity }
}

export function calculateCurvatureComponentsFromAcceleration(acceleration, velocity) {
  const xCurvature = acceleration.xAcceleration / Math.pow(velocity.xVelocity, 2)
  const yCurvature = acceleration.yAcceleration / Math.pow(velocity.yVelocity, 2)

  return { xCurvature, yCurvature }
}

export function calculateCurvatureComponentsFromAngularVelocity(angularVelocity, velocity) {
  const xCurvature = angularVelocity.xAngularVelocity / velocity.xVelocity
  const yCurvature = angularVelocity.yAngularVelocity / velocity.yVelocity

  return { xCurvature, yCurvature }
}
