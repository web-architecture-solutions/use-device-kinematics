import { useEffect, useState } from 'react'

export default function useHeading({ alpha }) {
  const [heading, setHeading] = useState(null)

  const angle = window.screen.orientation.angle

  useEffect(() => {
    if (alpha !== null) {
      setHeading((360 - alpha + angle) % 360)
    }
  }, [alpha, angle])

  return heading
}
