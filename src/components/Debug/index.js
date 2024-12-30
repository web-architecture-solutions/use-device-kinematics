import styles from './style.module.scss'

export default function Debug({ data }) {
  return data && Object.keys(data).length > 0 ? (
    <table className={styles.Debug}>
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : null
}
