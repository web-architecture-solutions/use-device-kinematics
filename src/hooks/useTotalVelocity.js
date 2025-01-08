import { useEffect, useState } from 'react'

import { calculateTotalVelocity } from '../physics'

export default function useTotalVelocity({ latitude, longitude, timeInterval }) {
  const [points, setPoints] = useState([null, null])
  const [totalVelocity, setTotalVelocity] = useState(0)

  const [p1, p2] = points

  useEffect(() => {
    setPoints(([p2]) => {
      return [{ latitude, longitude }, p2]
    })
  }, [latitude, longitude])

  useEffect(() => {
    setTotalVelocity(calculateTotalVelocity(p1, p2, timeInterval))
  }, [p1?.latitude, p1?.longitude, p2?.latitude, p2?.longitude])

  return totalVelocity
}
