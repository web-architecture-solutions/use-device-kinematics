import styles from './style.module.scss'

export default function Frame({ children }) {
  return (
    <div className={styles.Frame}>
      {children}

      <div className={styles.mask}></div>
    </div>
  )
}
