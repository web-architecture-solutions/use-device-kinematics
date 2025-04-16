import { useState } from 'react'

import useDeviceKinematics from '../../hooks/use-device-kinematics'
//import useKalmanFilter from '../../hooks/use-kalman-filter/useKalmanFilter'

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
  const [dataSource, setDataSource] = useState(DataSource.DEVICE_KINEMATICS)

  const { deviceKinematics, iirfData, rawSensorData, refreshRates, errors, isListening, startListening } = useDeviceKinematics({
    enableHighAccuracy: true
  })

  //const { state } = useKalmanFilter(deviceKinematics)

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
        <select onChange={handleOnDataSourceChange} defaultValue={DataSource.DEVICE_KINEMATICS.description}>
          <option value={DataSource.RAW_DATA.description}>Raw Sensor Data</option>
          <option value={DataSource.REFRESH_RATES.description}>Sensor Refresh Rates</option>
          <option value={DataSource.IIRF_DATA.description}>IIRF Data</option>
          <option value={DataSource.DEVICE_KINEMATICS.description}>Device Kinematics</option>
        </select>

        <button onClick={startListening}>{isListening ? 'Stop' : 'Start'}</button>
      </form>

      {/*isListening ? <pre>{JSON.stringify(state, null, 4)}</pre> : null*/}

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
