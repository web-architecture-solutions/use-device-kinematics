export default function Data({ heading, data }) {
  return (
    <section>
      <h2>{heading}</h2>

      <pre>{JSON.stringify(data, null, 4)}</pre>
    </section>
  )
}
