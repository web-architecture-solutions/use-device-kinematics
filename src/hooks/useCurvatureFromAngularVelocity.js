import { useEffect, useState } from 'react'

import { calculateCurvatureFromAngularVelocity } from '../physics'

export default function useCurvatureFromAngularVelocity({ totalAngularVelocity, velocity }) {
  const [curvatureFromAngularVelocity, setCurvatureFromAngularVelocity] = useState(0)
  useEffect(() => {
    setCurvatureFromAngularVelocity(calculateCurvatureFromAngularVelocity(totalAngularVelocity, velocity))
  }, [totalAngularVelocity, velocity])
  return curvatureFromAngularVelocity
}
