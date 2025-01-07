const R = 6371000

const toRadians = (degrees) => degrees * (Math.PI / 180)

function calculateHaversineDistance(p1, p2) {
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
  return Math.sqrt(Math.pow(alpha, 2) + Math.pow(beta, 2) + Math.pow(gamma, 2))
}

export function calculateTotalAcceleration(x, y, z) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))
}

export function calculateVelocity(angularVelocity, curvature) {
  return angularVelocity / curvature
}
