import { useEffect, useState } from 'react'

import { calculateTotalAccelerationFromComponents } from '../physics'

export default function useTotalAcclerationFromComponents(x, y, z) {
  const [totalAcceleration, setTotalAcceleration] = useState(null)

  useEffect(() => {
    if (x && y && z) {
      setTotalAcceleration(calculateTotalAccelerationFromComponents(x, y, z))
    }
  }, [x, y, z])

  return totalAcceleration
}
