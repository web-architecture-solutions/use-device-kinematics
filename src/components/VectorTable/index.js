import DataTableHeader from '../DataTableHeader'
import DataTableCell from '../DataTableCell'

export default function VectorTable({ variables, vector }) {
  return (
    <table style={{ width: `${vector.length * 6}em` }}>
      <DataTableHeader variables={variables} />

      <tbody>
        <tr>
          {vector.map((variable, index) => (
            <DataTableCell variable={variable} key={index} />
          ))}
        </tr>
      </tbody>
    </table>
  )
}
