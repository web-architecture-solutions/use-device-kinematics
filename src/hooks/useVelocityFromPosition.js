import { useEffect, useState } from 'react'

import { calculateVelocityFromPosition } from '../physics'

export default function useVelocityFromPosition({ latitude, longitude, timeInterval }) {
  const [points, setPoints] = useState([null, null])
  const [velocity, setVelocity] = useState(0)

  const [p1, p2] = points

  useEffect(() => {
    setPoints(([p2]) => {
      return [{ latitude, longitude }, p2]
    })
  }, [latitude, longitude])

  useEffect(() => {
    setVelocity(calculateVelocityFromPosition(p1, p2, timeInterval))
  }, [p1?.latitude, p1?.longitude, p2?.latitude, p2?.longitude])

  return velocity
}
