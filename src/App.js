import { useState } from 'react'

import useDeviceKinematics from './hooks/use-device-kinematics'

import { VariableNames } from './lib/constants'

const DataSource = {
  DEVICE_KINEMATICS: Symbol('DEVICE_KINEMATICS'),
  IIRF_DATA: Symbol('IIRF_DATA'),
  RAW_DATA: Symbol('RAW_DATA'),
  REFRESH_RATES: Symbol('REFRESH_RATES')
}

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

function DataTableHeader({ variables }) {
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

function DataCell({ variable }) {
  return <td>{typeof variable === 'number' ? variable.toFixed(2) : `${variable}`}</td>
}

function VectorTable({ variables, vector }) {
  return (
    <table>
      <DataTableHeader variables={variables} />

      <tbody>
        <tr>
          {vector.map((variable, index) => (
            <DataCell variable={variable} key={index} />
          ))}
        </tr>
      </tbody>
    </table>
  )
}

function MatrixTable({ variables, matrix }) {
  return (
    <table>
      <DataTableHeader variables={variables} />

      <tbody>
        {matrix.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((variable, colIndex) => (
              <DataCell variable={variable} key={colIndex} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DeviceKinematics({ deviceKinematics }) {
  return (
    <section>
      <h2>Device Kinematics</h2>

      <h3>State Vector</h3>

      <VectorTable variables={deviceKinematics.variables} vector={deviceKinematics.stateVector} />

      <h3>State Transition Matrix</h3>

      <MatrixTable variables={deviceKinematics.variables} matrix={deviceKinematics.stateTransitionMatrix} />

      <h3>Observation Matrix</h3>

      <MatrixTable variables={deviceKinematics.variables} matrix={deviceKinematics.observationMatrix} />
    </section>
  )
}

export default function App() {
  const [dataSource, setDataSource] = useState(DataSource.DEVICE_KINEMATICS)

  const { deviceKinematics, iirfData, rawSensorData, refreshRates, errors, isListening, startListening } = useDeviceKinematics({
    enableHighAccuracy: true
  })

  function handleOnDataSourceChange(event) {
    switch (event.target.value) {
      case DataSource.DEVICE_KINEMATICS.description:
        setDataSource(DataSource.DEVICE_KINEMATICS)
        break

      case DataSource.IIRF_DATA.description:
        setDataSource(DataSource.IIRF_DATA)
        break

      case DataSource.RAW_DATA.description:
        setDataSource(DataSource.RAW_DATA)
        break

      case DataSource.REFRESH_RATES.description:
        setDataSource(DataSource.REFRESH_RATES)
        break

      default:
        break
    }
  }

  return (
    <div>
      <h1>Device Sensor Data</h1>

      <form>
        <select onChange={handleOnDataSourceChange}>
          <option value="RAW_DATA">Raw Sensor Data</option>
          <option value="REFRESH_RATES">Sensor Refresh Rates</option>
          <option value="IIRF_DATA">IIRF Data</option>
          <option value="DEVICE_KINEMATICS">Device Kinematics</option>
        </select>

        <button onClick={startListening}>{isListening ? 'Stop' : 'Start'}</button>
      </form>

      {isListening ? <DeviceKinematics deviceKinematics={deviceKinematics} /> : <p>Click button to start.</p>}

      {errors && Object.keys(errors).length > 0 ? (
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
      ) : null}
    </div>
  )
}
