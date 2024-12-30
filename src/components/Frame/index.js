import { useRadialMousePosition } from './hooks'

import styles from './style.module.css'

export default function Frame({ children }) {
  const { theta } = useRadialMousePosition()

  return (
    <div className={styles.Frame} style={{ filter: `hue-rotate(${theta}deg)` }}>
      {children}
    </div>
  )
}
