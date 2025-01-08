import { useEffect, useState } from 'react'

import { calculateJerk } from '../physics'

export default function useJerk({ totalAcceleration, timeInterval }) {
  const [accelerations, setAcclerations] = useState([])
  const [jerk, setJerk] = useState(0)
  useEffect(() => {
    setAcclerations(([oldAcceleration]) => [totalAcceleration, oldAcceleration])
    if (accelerations[0] && accelerations[1]) {
      setJerk(calculateJerk(accelerations[0], accelerations[1], timeInterval))
    }
  }, [totalAcceleration])
  useEffect(() => {}, [])
  return jerk
}
