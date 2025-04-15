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

function DeviceKinematics({ deviceKinematics }) {
  return (
    <section>
      <h2>Device Kinematics</h2>

      <h3>State Vector</h3>

      <table>
        <thead>
          <tr>
            {deviceKinematics.variables.map((variable) =>
              coordinates.map((coordinate) => (
                <th>
                  {VariableAbbreviations[variable.name]}
                  <sub>{coordinate}</sub>
                </th>
              ))
            )}
          </tr>
        </thead>

        <tbody>
          <tr>
            {deviceKinematics.stateVector.map((variable) => (
              <td>{variable === null ? 'null' : variable}</td>
            ))}
          </tr>
        </tbody>
      </table>

      <h3>State Transition Matrix</h3>

      <table>
        <tbody>
          {deviceKinematics.coriolisEffectMatrix.map((row) => (
            <tr>
              <td>{JSON.stringify(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

          <pre>{JSON.stringify(errors, null, 2)}</pre>
        </section>
      ) : null}
    </div>
  )
}
