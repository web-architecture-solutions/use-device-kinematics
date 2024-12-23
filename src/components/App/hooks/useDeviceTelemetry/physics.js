/**
 * Calculates fallback velocity using geolocation coordinates and timestamps.
 * @param {Object} coord1 - The first geolocation coordinate.
 * @param {Object} coord2 - The second geolocation coordinate.
 * @returns {number|null} The calculated velocity in meters per second, or null if data is insufficient.
 */
export function calculateVelocity(coord1, coord2) {
  if (!coord1 || !coord2) return null
  const R = 6371e3 // Earth's radius in meters
  const lat1 = (coord1.latitude * Math.PI) / 180
  const lat2 = (coord2.latitude * Math.PI) / 180
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in meters
  const timeDiff = (coord2.timestamp - coord1.timestamp) / 1000 // Time difference in seconds
  return timeDiff > 0 ? distance / timeDiff : null
}

/**
 * Calculates angular acceleration using rotation rate data and timestamps.
 * @param {Object} current - The current rotation rate.
 * @param {Object} previous - The previous rotation rate.
 * @param {number} timeDiff - The time difference in seconds.
 * @returns {Object} The angular acceleration for alpha, beta, and gamma.
 */
export function calculateAngularAcceleration(current, previous, timeDiff) {
  if (!timeDiff) return { alpha: 0, beta: 0, gamma: 0 }
  return {
    alpha: (current.alpha - previous.alpha) / timeDiff,
    beta: (current.beta - previous.beta) / timeDiff,
    gamma: (current.gamma - previous.gamma) / timeDiff
  }
}
