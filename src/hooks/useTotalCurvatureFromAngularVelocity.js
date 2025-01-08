import { useEffect, useState } from 'react'

import { calculateTotalCurvatureFromAngularVelocity } from '../physics'

export default function useTotalCurvatureFromAngularVelocity({ totalAngularVelocity, totalVelocity }) {
  const [totalCurvatureFromAngularVelocity, setTotalCurvatureFromAngularVelocity] = useState(0)
  useEffect(() => {
    setTotalCurvatureFromAngularVelocity(calculateTotalCurvatureFromAngularVelocity(totalAngularVelocity, totalVelocity))
  }, [totalAngularVelocity, totalVelocity])
  return totalCurvatureFromAngularVelocity
}
