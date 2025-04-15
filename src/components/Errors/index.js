export default function Errors({ errors }) {
  return errors && Object.keys(errors).length > 0 ? (
    <section>
      <h2>Errors</h2>

      <dl>
        {Object.entries(errors).map(([code, message], index) => (
          <span key={index}>
            <dt>{code}:</dt>
            <dd>{message}</dd>
          </span>
        ))}
      </dl>
    </section>
  ) : null
}
