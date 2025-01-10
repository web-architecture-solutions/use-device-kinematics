import { useEffect, useState } from 'react'

import { calculateJerkFromAcceleration } from '../physics'

const initialAcceleration = { xAcceleration: null, yAcceleration: null, zAcceleration: null, totalAcceleration: null }

export default function useJerkFromAcceleration(xAcceleration, yAcceleration, zAcceleration, totalAcceleration, timeInterval) {
  const [[acceleration1, acceleration2], setAccelerations] = useState([initialAcceleration, initialAcceleration])
  const [data, setData] = useState({})

  useEffect(() => {
    setAccelerations(([oldAcceleration]) => [{ xAcceleration, yAcceleration, totalAcceleration }, oldAcceleration])
    setData(calculateJerkFromAcceleration(acceleration1, acceleration2, timeInterval))
  }, [xAcceleration, yAcceleration, zAcceleration, totalAcceleration, timeInterval])

  return data
}
