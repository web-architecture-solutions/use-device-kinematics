import { useEffect, useState } from 'react'

import { calculateHaversineDistance } from '../physics'

function leastSquaresCircle(points) {
  if (points.length < 3) return null

  let sumX = 0
  let sumY = 0
  let sumX2 = 0
  let sumY2 = 0
  let sumX3 = 0
  let sumY3 = 0
  let sumXY = 0
  let sumX2Y = 0
  let sumXY2 = 0

  for (const p of points) {
    sumX += p?.latitude
    sumY += p?.longitude
    sumX2 += p?.latitude * p?.latitude
    sumY2 += p?.longitude * p?.longitude
    sumX3 += p?.latitude * p?.latitude * p?.latitude
    sumY3 += p?.longitude * p?.longitude * p?.longitude
    sumXY += p?.latitude * p?.longitude
    sumX2Y += p?.latitude * p?.latitude * p?.longitude
    sumXY2 += p?.latitude * p?.longitude * p?.longitude
  }

  const N = points.length
  const D = N * (sumX2 * sumY2 - sumXY * sumXY) - sumX * (sumX3 * sumY2 - sumXY * sumXY2) + sumY * (sumX2 * sumXY2 - sumXY * sumX3)

  if (D === 0) return null

  const Uc = (sumX3 * sumY2 - sumXY * sumXY2) / D
  const Vc = (sumX2 * sumXY2 - sumXY * sumX3) / D
  const center = { latitude: Uc, longitude: Vc }

  let radius = 0
  for (const p of points) {
    radius += calculateHaversineDistance(center, p)
  }

  radius /= N

  return 1 / radius
}

/*
export default function useCurvature({ latitude, longitude }) {
  const [points, setPoints] = useState([null, null, null])
  const [curvature, setCurvature] = useState(null)

  const [p1, p2, p3] = points

  useEffect(() => {
    if (latitude && longitude) {
      setPoints((oldPoints) => [...oldPoints.slice(1), { latitude, longitude }])
    }
  }, [latitude, longitude])

  useEffect(() => {
    if (p1 && p2 && p3) {
      const curvature = calculateCurvature(points[0], points[1], points[2])
      setCurvature(curvature)
    }
  }, [p1?.latitude, p1?.longitude, p2?.latitude, p2?.longitude, p3?.latitude, p3?.longitude])

  return { curvature, points }
}
*/

export default function useCurvature({ latitude, longitude, numPoints = 10 }) {
  const [points, setPoints] = useState(Array.from({ length: numPoints }, () => null))
  const [curvature, setCurvature] = useState(null)

  useEffect(() => {
    if (latitude && longitude) {
      setPoints((oldPoints) => [...oldPoints.slice(1), { latitude, longitude }])
    }
  }, [latitude, longitude, numPoints])

  useEffect(() => {
    setCurvature(leastSquaresCircle(points))
  }, [points, numPoints])

  return { curvature, points }
}
