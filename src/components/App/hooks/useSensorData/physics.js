/**
 * Calculates the displacement (change in position) in latitude and longitude (in meters) using the Haversine formula.
 * Returns signed displacements.
 * @param {Object} coord1 - The first geolocation coordinate.
 * @param {Object} coord2 - The second geolocation coordinate.
 * @returns {{deltaLat: number, deltaLon: number}} Signed displacement in latitude and longitude (in meters).
 */

export function calculateDisplacement(coord1, coord2) {
  const R = 6371e3
  const latDiff = coord2.latitude - coord1.latitude
  const lonDiff = coord2.longitude - coord1.longitude

  // Amplification based on 4 decimal places
  const AMPLIFICATION_FACTOR = 10000 // Amplify by 10^4

  const amplifiedLatDiff = latDiff * AMPLIFICATION_FACTOR
  const amplifiedLonDiff = lonDiff * AMPLIFICATION_FACTOR

  // Convert amplified differences to radians
  const deltaLatRad = (amplifiedLatDiff * Math.PI) / 180
  const deltaLonRad = (amplifiedLonDiff * Math.PI) / 180

  //Clamp the amplified values to prevent excessive jumps
  const MAX_AMPLIFIED_DELTA = 10 // Adjust as needed
  const deltaLatMeters = Math.max(-MAX_AMPLIFIED_DELTA, Math.min(MAX_AMPLIFIED_DELTA, deltaLatRad * R))
  const deltaLonMeters = Math.max(
    -MAX_AMPLIFIED_DELTA,
    Math.min(MAX_AMPLIFIED_DELTA, deltaLonRad * R * Math.cos(((coord1.latitude * Math.PI) / 180 + (coord2.latitude * Math.PI) / 180) / 2))
  )

  return {
    deltaLat: deltaLatMeters,
    deltaLon: deltaLonMeters
  }
}

/**
 * Calculates velocity components.
 * @param {number} deltaLat - Change in latitude * radius (in meters).
 * @param {number} deltaLon - Change in longitude * radius (in meters).
 * @param {number} timeDiff - Time difference in seconds.
 * @returns {{latitudinalVelocity: number|null, longitudinalVelocity: number|null}} Object with component velocities.
 */
export function calculateComponentVelocity(deltaLat, deltaLon, timeDiff) {
  if (!timeDiff) return { latitudinalVelocity: null, longitudinalVelocity: null }

  const latitudinalVelocity = deltaLat / timeDiff
  const longitudinalVelocity = deltaLon / timeDiff

  return {
    latitudinalVelocity,
    longitudinalVelocity
  }
}

/**
 * Calculates total velocity (magnitude of velocity vector).
 * @param {number} latitudinalVelocity - Velocity in the North-South direction.
 * @param {number} longitudinalVelocity - Velocity in the East-West direction.
 * @returns {number} Total velocity.
 */
export function calculateTotalVelocity(latitudinalVelocity, longitudinalVelocity) {
  return Math.sqrt(latitudinalVelocity ** 2 + longitudinalVelocity ** 2)
}

/**
 * Calculates component-wise angular acceleration.
 * @param {number} currentAlpha - Current alpha.
 * @param {number} previousAlpha - Previous alpha.
 * @param {number} currentBeta - Current beta.
 * @param {number} previousBeta - Previous beta.
 * @param {number} currentGamma - Current gamma.
 * @param {number} previousGamma - Previous gamma.
 * @param {number} timeDiff - Time difference in seconds.
 * @returns {{alpha: number, beta: number, gamma: number}} Component-wise angular acceleration.
 */
export function calculateComponentAngularAcceleration(
  currentAlpha,
  previousAlpha,
  currentBeta,
  previousBeta,
  currentGamma,
  previousGamma,
  timeDiff
) {
  if (!timeDiff) return { alpha: 0, beta: 0, gamma: 0 }
  return {
    alpha: (currentAlpha - previousAlpha) / timeDiff,
    beta: (currentBeta - previousBeta) / timeDiff,
    gamma: (currentGamma - previousGamma) / timeDiff
  }
}

/**
 * Calculates total angular acceleration.
 * @param {number} deltaAlpha - Change in alpha.
 * @param {number} deltaBeta - Change in beta.
 * @param {number} deltaGamma - Change in gamma.
 * @param {number} timeDiff - Time difference in seconds.
 * @returns {number} The total angular acceleration.
 */
export function calculateTotalAngularAcceleration(deltaAlpha, deltaBeta, deltaGamma, timeDiff) {
  if (!timeDiff) return 0
  return Math.sqrt(deltaAlpha ** 2 + deltaBeta ** 2 + deltaGamma ** 2) / timeDiff
}
