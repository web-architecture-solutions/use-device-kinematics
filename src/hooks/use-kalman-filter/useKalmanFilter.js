import { useState, useCallback, useMemo } from 'react'
import { KalmanFilter } from 'kalman-filter'

export default function useKalmanFilter(deviceKinematics) {
  const [state, setState] = useState({
    mean: deviceKinematics.stateVector,
    covariance: deviceKinematics.processNoiseMatrix
  })

  const kFilter = useMemo(
    () =>
      new KalmanFilter({
        dynamic: {
          init: {
            mean: deviceKinematics.stateVector,
            covariance: deviceKinematics.processNoiseMatrix
          },
          transition: deviceKinematics.stateTransitionMatrix,
          covariance: deviceKinematics.processNoiseMatrix
        },
        observation: {
          stateProjection: deviceKinematics.observationMatrix,
          covariance: deviceKinematics.observationNoiseMatrix
        }
      }),
    [deviceKinematics]
  )

  const update = useCallback(
    (observation) => {
      const { mean, covariance } = kFilter.filter(state.mean, state.covariance, observation)
      setState({ mean, covariance })
    },
    [state, kFilter]
  )

  const reset = useCallback(() => {
    setState({
      mean: deviceKinematics.stateVector,
      covariance: deviceKinematics.processNoiseMatrix
    })
  }, [deviceKinematics])

  return { state, update, reset }
}
