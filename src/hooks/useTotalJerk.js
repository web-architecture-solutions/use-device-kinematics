import { useEffect, useState } from 'react'

import { calculateJerkFromAcceleration } from '../physics'

export default function useTotalJerk({ totalAcceleration, timeInterval }) {
  const [accelerations, setAcclerations] = useState([])
  const [totalJerk, setTotalJerk] = useState(0)
  useEffect(() => {
    setAcclerations(([oldAcceleration]) => [totalAcceleration, oldAcceleration])
    if (accelerations[0] && accelerations[1]) {
      // TODO: implement components
      const {
        xJerk,
        yJerk,
        totalJerk: _totalJerk
      } = calculateJerkFromAcceleration({ totalAcceleration: accelerations[0] }, { totalAcceleration: accelerations[1] }, timeInterval)
      setTotalJerk(_totalJerk)
    }
  }, [totalAcceleration])
  useEffect(() => {}, [])
  return totalJerk
}
