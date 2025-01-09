import { useEffect, useState } from 'react'

import { calculateTotalAngularVelocityFromComponents } from '../physics'

export default function useTotalAngularVelocityFromComponents(alpha, beta, gamma) {
  const [totalAngularVelocity, setTotalAngularVelocity] = useState(null)

  useEffect(() => {
    if (alpha && beta && gamma) {
      setTotalAngularVelocity(calculateTotalAngularVelocityFromComponents(alpha, beta, gamma))
    }
  }, [alpha, beta, gamma])

  return totalAngularVelocity
}
