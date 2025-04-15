import DataTableHeader from '../DataTableHeader'
import DataTableCell from '../DataTableCell'

export default function VectorTable({ variables, vector, emsPerCell }) {
  return (
    <table style={{ width: `${vector.length * emsPerCell}em` }}>
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
