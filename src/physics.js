const toRadians = (degrees) => degrees * (Math.PI / 180)

const sumSquares = (accumulator, component) => accumulator + Math.pow(component, 2)

const euclideanNorm = (...components) => Math.sqrt(components.reduce(sumSquares, 0))

export function calculateHaversineDistance({ latitude: latitude1, longitude: longitude1 }, { latitude: latitude2, longitude: longitude2 }) {
  const R = 6371000
  if (latitude1 === null || latitude2 === null || longitude1 === null || longitude2 === null)
    return { distance: null, deltaLat: null, deltaLon: null }

  const deltaLat = toRadians(latitude2 - latitude1)
  const deltaLon = toRadians(longitude2 - longitude1)

  const lat1 = toRadians(latitude1)
  const lat2 = toRadians(latitude2)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return {
    distance: c * R,
    deltaLat: deltaLat * R,
    deltaLon: deltaLon * R
  }
}

export function calculateVelocityFromPosition(p1, p2, timeInterval) {
  const { distance, deltaLat, deltaLon } = calculateHaversineDistance(p1, p2)

  const xVelocityFromPosition = deltaLon / timeInterval
  const yVelocityFromPosition = deltaLat / timeInterval
  const totalVelocityFromPosition = distance / timeInterval

  return { xVelocityFromPosition, yVelocityFromPosition, totalVelocityFromPosition }
}

export function calculateTotalAccelerationFromComponents(xAcceleration, yAcceleration, zAcceleration) {
  return euclideanNorm(xAcceleration, yAcceleration, zAcceleration)
}

export function calculateTotalAngularVelocityFromComponents(alpha, beta, gamma) {
  return euclideanNorm(alpha * (Math.PI / 180), beta * (Math.PI / 180), gamma * (Math.PI / 180))
}

/*
export function calculateJerkFromAcceleration(
  { totalAcceleration: totalAcceleration1, xAcceleration: xAcceleration1, yAcceleration: yAcceleration1 },
  { totalAcceleration: totalAcceleration2, yAcceleration: xAcceleration2, yAcceleration: yAcceleration2 },
  timeInterval
) {
  const xJerk = (xAcceleration2 - xAcceleration1) / timeInterval
  const yJerk = (yAcceleration2 - yAcceleration1) / timeInterval
  const totalJerk = (totalAcceleration1 - totalAcceleration2) / timeInterval
  return { xJerk, yJerk, totalJerk }
}

export function calculateJerkComponents(acceleration1, acceleration2, timeInterval) {
  const xJerk = (acceleration2.xAcceleration - acceleration1.xAcceleration) / timeInterval
  const yJerk = (acceleration2.yAcceleration - acceleration1.yAcceleration) / timeInterval

  return { xJerk, yJerk }
}

export function calculateTotalCurvatureFromAcceleration(totalAcceleration, totalVelocity) {
  return totalAcceleration / Math.pow(totalVelocity, 2)
}

export function calculateTotalCurvatureFromAngularVelocity(totalAngularVelocity, totalVelocity) {
  return totalAngularVelocity / totalVelocity
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
*/
