import { useEffect, useState } from 'react'

import { calculateCurvature } from '../lib/physics'

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
