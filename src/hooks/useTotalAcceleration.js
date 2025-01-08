import { useEffect, useState } from 'react'

import { calculateTotalAcceleration } from '../physics'

export default function useTotalAccleration({ x, y, z }) {
  const [totalAcceleration, setTotalAcceleration] = useState(null)

  useEffect(() => {
    if (x && y && z) {
      const _totalAcceleration = calculateTotalAcceleration(x, y, z)
      setTotalAcceleration(_totalAcceleration)
    }
  }, [x, y, z])

  return totalAcceleration
}
