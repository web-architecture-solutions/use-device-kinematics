import { useEffect, useState } from 'react'

import { calculateTotalCurvatureFromAcceleration } from '../physics'

export default function useTotalCurvatureFromAcceleration({ totalAcceleration, totalVelocity }) {
  const [totalCurvaturefromAcceleration, setTotalCurvatureFromAcceleration] = useState(0)
  useEffect(() => {
    setTotalCurvatureFromAcceleration(calculateTotalCurvatureFromAcceleration(totalAcceleration, totalVelocity))
  }, [totalAcceleration, totalVelocity])
  return totalCurvaturefromAcceleration
}
