import DataTableHeader from '../DataTableHeader'
import DataTableCell from '../DataTableCell'

export default function MatrixTable({ variables, matrix }) {
  return (
    <table style={{ width: `${matrix[0].length * 6}em` }}>
      <DataTableHeader variables={variables} />

      <tbody>
        {matrix.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((variable, colIndex) => (
              <DataTableCell variable={variable} key={colIndex} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
