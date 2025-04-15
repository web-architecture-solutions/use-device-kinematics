export default function Errors({ errors }) {
  return errors && Object.keys(errors).length > 0 ? (
    <dl>
      {Object.entries(errors).map(([code, message], index) => (
        <span key={index}>
          <dt>{code}:</dt>
          <dd>{message}</dd>
        </span>
      ))}
    </dl>
  ) : null
}
