import { useEffect, useState } from 'react'

import { calculateTotalAngularVelocity } from '../physics'

export default function useTotalAngularVelocity({ alpha, beta, gamma }) {
  const [totalAngularVelocity, setTotalAngularVelocity] = useState(null)

  useEffect(() => {
    if (alpha && beta && gamma) {
      // TODO: implement components
      const {
        xAngularVelocity,
        yAngularVelocity,
        totalAngularVelocity: _totalAngularVelocity
      } = calculateTotalAngularVelocity(alpha, beta, gamma)
      setTotalAngularVelocity(_totalAngularVelocity)
    }
  }, [alpha, beta, gamma])

  return totalAngularVelocity
}
