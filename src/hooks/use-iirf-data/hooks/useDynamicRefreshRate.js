import { useEffect, useState } from 'react'

export default function useDynamicRefreshRate(refreshRates) {
  const [refreshRate, setRefreshRate] = useState(null)
  useEffect(() => setRefreshRate(Math.max(...Object.values(refreshRates))), [refreshRates])
  return refreshRate
}
