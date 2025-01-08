import { useEffect, useState } from 'react'

import { calculateCurvatureFromAcceleration } from '../physics'

export default function useCurvatureFromAcceleration({ totalAcceleration, totalVelocity }) {
  const [curvaturefromAcceleration, setCurvatureFromAcceleration] = useState(0)
  useEffect(() => {
    setCurvatureFromAcceleration(calculateCurvatureFromAcceleration(totalAcceleration, totalVelocity))
  }, [totalAcceleration, totalVelocity])
  return curvaturefromAcceleration
}
