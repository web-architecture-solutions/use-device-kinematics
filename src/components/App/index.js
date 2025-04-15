import { useState } from 'react'

import useDeviceKinematics from '../../hooks/use-device-kinematics'

const DataSource = {
  DEVICE_KINEMATICS: Symbol('DEVICE_KINEMATICS'),
  IIRF_DATA: Symbol('IIRF_DATA'),
  RAW_DATA: Symbol('RAW_DATA'),
  REFRESH_RATES: Symbol('REFRESH_RATES')
}

import DeviceKinematics from '../DeviceKinematics'
import Errors from '../Errors'

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

      <section>
        <h2>Errors</h2>

        <Errors errors={errors} />
      </section>
    </div>
  )
}
