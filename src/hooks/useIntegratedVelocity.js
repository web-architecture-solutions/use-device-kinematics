import { useEffect, useState } from 'react'

import { integrateAccelerationSimpson } from '../lib/physics'

export default function useIntegratedVelocity({ totalAcceleration, timestamp }) {
  const [accelerationSamples, setAccelerationSamples] = useState(Array.from({ length: 10 }, () => null))

  useEffect(() => {
    if (totalAcceleration) {
      setAccelerationSamples((oldAccelerationSamples) => [
        ...oldAccelerationSamples.slice(1),
        { acceleration: totalAcceleration, timestamp }
      ])
    }
  }, [totalAcceleration])

  const { velocity } = integrateAccelerationSimpson(accelerationSamples)

  return { velocity, accelerationSamples }
}
