import styles from './style.module.css'

export default function Frame({ children }) {
  return <div className={styles.Frame}>{children}</div>
}
