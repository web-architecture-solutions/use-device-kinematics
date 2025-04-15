import { useState } from 'react'

import useDeviceKinematics from '../../hooks/use-device-kinematics'

import Data from '../Data'
import DeviceKinematics from '../DeviceKinematics'
import Errors from '../Errors'

const DataSource = {
  DEVICE_KINEMATICS: Symbol('DEVICE_KINEMATICS'),
  IIRF_DATA: Symbol('IIRF_DATA'),
  RAW_DATA: Symbol('RAW_DATA'),
  REFRESH_RATES: Symbol('REFRESH_RATES')
}

export default function App() {
  const [dataSource, setDataSource] = useState(DataSource.RAW_DATA)

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

      {isListening ? (
        dataSource === DataSource.DEVICE_KINEMATICS ? (
          <DeviceKinematics deviceKinematics={deviceKinematics} />
        ) : dataSource === DataSource.REFRESH_RATES ? (
          <Data heading="Refresh Rates" data={refreshRates} />
        ) : dataSource === DataSource.RAW_DATA ? (
          <Data heading="Raw Sensor Data" data={rawSensorData} />
        ) : dataSource === DataSource.IIRF_DATA ? (
          <Data heading="IIRF Data" data={iirfData} />
        ) : null
      ) : (
        <p>Click button to start.</p>
      )}

      <Errors errors={errors} />
    </div>
  )
}
