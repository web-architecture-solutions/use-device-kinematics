import { useEffect, useState } from 'react'

import { calculateCurvatureFromAcceleration } from '../physics'

export default function useCurvatureFromAcceleration({ totalAcceleration, velocity }) {
  const [curvaturefromAcceleration, setCurvatureFromAcceleration] = useState(0)
  useEffect(() => {
    setCurvatureFromAcceleration(calculateCurvatureFromAcceleration(totalAcceleration, velocity))
  }, [totalAcceleration, velocity])
  return curvaturefromAcceleration
}
