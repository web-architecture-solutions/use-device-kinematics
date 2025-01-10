import { useEffect, useState } from 'react'

import { calculateVelocityFromPosition } from '../physics'

const initialPoint = { latitude: null, longitude: null }

export default function useVelocityFromPosition(latitude = null, longitude = null, timeInterval) {
  const [[p1, p2], setPoints] = useState([initialPoint, initialPoint])
  const [data, setData] = useState({})

  useEffect(() => {
    setPoints(([oldPoint]) => [{ latitude, longitude }, oldPoint])
    setData(calculateVelocityFromPosition(p1, p2, timeInterval))
  }, [latitude, longitude, timeInterval])

  return data
}
