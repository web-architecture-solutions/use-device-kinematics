import { toRadians } from './math'

export function haversineDistance({ x, y, z }, { x: previousX, y: previousY, z: previousZ }) {
  const coordinates2D = [x, previousX, y, previousY]
  if (coordinates2D.some((coordinate) => coordinate === null)) {
    return { x: null, y: null, z: null, xy: null, xyz: null }
  }

  const R = 6371000

  const deltaX = toRadians(x - previousX)
  const deltaY = toRadians(y - previousY)
  const deltaZ = z - previousZ

  const lat1 = toRadians(previousY)
  const lat2 = toRadians(y)

  const a = Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaX / 2) * Math.sin(deltaX / 2)
  const b = Math.sin(deltaY / 2) * Math.sin(deltaY / 2) + a
  const c = 2 * Math.atan2(Math.sqrt(b), Math.sqrt(1 - b))

  const xy = c * R

  return {
    x: deltaX * R * Math.cos((lat1 + lat2) / 2),
    y: deltaY * R,
    z: deltaZ,
    xy: c * R,
    xyz: Math.sqrt(xy * xy + z * z)
  }
}
