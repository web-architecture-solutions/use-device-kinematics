import { useEffect, useState } from 'react'

import { calculateCurvatureFromAngularVelocity } from '../physics'

export default function useCurvatureFromAngularVelocity({ totalAngularVelocity, totalVelocity }) {
  const [curvatureFromAngularVelocity, setCurvatureFromAngularVelocity] = useState(0)
  useEffect(() => {
    setCurvatureFromAngularVelocity(calculateCurvatureFromAngularVelocity(totalAngularVelocity, totalVelocity))
  }, [totalAngularVelocity, totalVelocity])
  return curvatureFromAngularVelocity
}
