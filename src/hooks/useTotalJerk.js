import { useEffect, useState } from 'react'

import { calculateTotalJerk } from '../physics'

export default function useTotalJerk({ totalAcceleration, timeInterval }) {
  const [accelerations, setAcclerations] = useState([])
  const [totalJerk, setTotalJerk] = useState(0)
  useEffect(() => {
    setAcclerations(([oldAcceleration]) => [totalAcceleration, oldAcceleration])
    if (accelerations[0] && accelerations[1]) {
      setTotalJerk(calculateTotalJerk(accelerations[0], accelerations[1], timeInterval))
    }
  }, [totalAcceleration])
  useEffect(() => {}, [])
  return totalJerk
}
