import DataTableHeader from '../DataTableHeader'
import DataTableCell from '../DataTableCell'

export default function MatrixTable({ variables, matrix, emsPerCell }) {
  return (
    <table style={{ width: `${matrix[0].length * emsPerCell}em` }}>
      {variables ? <DataTableHeader variables={variables} /> : null}

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
