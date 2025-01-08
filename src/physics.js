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

function calculateHeronsFormula(s, a, b, c) {
  return Math.sqrt(s * (s - a) * (s - b) * (s - c))
}

function calculateSemiperimeter(a, b, c) {
  return (a + b + c) / 2
}

function calculateCircumradius(a, b, c) {
  const semiperimeter = calculateSemiperimeter(a, b, c)
  const area = calculateHeronsFormula(semiperimeter, a, b, c)
  return (a * b * c) / (4 * area)
}

export function calculateCurvature(p1, p2, p3) {
  const d1 = calculateHaversineDistance(p1, p2)
  const d2 = calculateHaversineDistance(p2, p3)
  const d3 = calculateHaversineDistance(p1, p3)
  const radius = calculateCircumradius(d1, d2, d3)
  if (isNaN(radius) || radius === Infinity) return 0
  return 1 / radius
}

export function calculateTotalAngularVelocity(alpha, beta, gamma) {
  return Math.sqrt(Math.pow(alpha * (Math.PI / 180), 2) + Math.pow(beta * (Math.PI / 180), 2) + Math.pow(gamma * (Math.PI / 180), 2))
}

export function calculateTotalAcceleration(x, y, z) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))
}

export function calculateVelocityFromAngularVelocityAndCurvature(angularVelocity, curvature) {
  return angularVelocity / curvature
}

function integrateAccelerationTrapezoidal(data) {
  if (data.length < 2) {
    return { velocity: 0, displacement: 0 }
  }

  let velocity = 0
  let displacement = 0

  for (let i = 1; i < data.length; i++) {
    const dt = data[i]?.timestamp - data[i - 1]?.timestamp
    const dv = 0.5 * (data[i]?.acceleration + data[i - 1]?.acceleration) * dt
    const dd = 0.5 * (velocity + velocity + dv) * dt
    velocity += dv
    displacement += dd
  }

  return { velocity, displacement }
}

export function integrateAccelerationSimpson(data) {
  if (data.length < 3) {
    return integrateAccelerationTrapezoidal(data)
  }

  let velocity = 0
  let displacement = 0

  for (let i = 2; i < data.length; i++) {
    const dt1 = data[i - 1]?.timestamp - data[i - 2]?.timestamp
    const dt2 = data[i]?.timestamp - data[i - 1]?.timestamp

    if (Math.abs(dt1 - dt2) > 1e-6) {
      return integrateAccelerationTrapezoidal(data)
    }
    const dt = (dt1 + dt2) / 2
    const dv = (dt / 3) * (data[i]?.acceleration + 4 * data[i - 1]?.acceleration + data[i - 2]?.acceleration)
    const dd = (dt / 3) * (velocity + 4 * (velocity + dv) + velocity)
    velocity += dv
    displacement += dd
  }

  return { velocity, displacement }
}

export function calculateVelocityFromPosition(p1, p2, timeInterval) {
  const distance = calculateHaversineDistance(p1, p2)
  return distance / timeInterval
}

export function calculateJerk(acceleration1, acceleration2, timeInterval) {
  return (acceleration2 - acceleration1) / timeInterval
}

export function calculateAngularVelocity(latitude1, latitude2, timeInterval) {
  const deltaLat = toRadians(latitude2 - latitude1)
  return deltaLat / timeInterval
}

export function calculateCurvatureFromAngularVelocity(angularVelocity, velocity) {
  return angularVelocity / velocity
}

export function calculateCurvatureFromAcceleration(acceleration, velocity) {
  return acceleration / Math.pow(velocity, 2)
}
