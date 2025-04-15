import { VariableNames } from '../../lib/constants'

const VariableAbbreviations = {
  [VariableNames.POSITION]: 'r',
  [VariableNames.VELOCITY]: 'v',
  [VariableNames.ACCELERATION]: 'a',
  [VariableNames.JERK]: 'j',
  [VariableNames.ORIENTATION]: <>&theta;</>,
  [VariableNames.ANGULAR_VELOCITY]: <>&omega;</>,
  [VariableNames.ANGULAR_ACCELERATION]: <>&alpha;</>,
  [VariableNames.ANGULAR_JERK]: <>&zeta;</>
}

const coordinates = ['x', 'y', 'z']

export default function DataTableHeader({ variables }) {
  return (
    <thead>
      <tr>
        {variables.map((variable) =>
          coordinates.map((coordinate) => (
            <th key={`${variable.name}_${coordinate}`}>
              {VariableAbbreviations[variable.name]}
              <sub>{coordinate}</sub>
            </th>
          ))
        )}
      </tr>
    </thead>
  )
}
