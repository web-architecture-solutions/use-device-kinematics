function stringifyNumeric(variable) {
  return `${variable >= 0 ? '+' : '-'}${Math.abs(variable).toFixed(2)}`
}

export default function DataTableCell({ variable }) {
  const isNumeric = typeof variable === 'number' && !isNaN(variable)
  const value = isNumeric ? stringifyNumeric(variable) : `${variable}`
  return <td>{value}</td>
}
