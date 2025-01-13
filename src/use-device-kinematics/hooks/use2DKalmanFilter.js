import { useState, useCallback } from 'react'

import { KalmanFilter } from 'kalman-filter'

export default function use2DKalmanFilter({ initialMean, initialCovariance, transition, processNoise, observation, observationNoise }) {
  const [state, setState] = useState({
    mean: initialMean,
    covariance: initialCovariance
  })

  const kFilter = new KalmanFilter({
    dynamic: {
      init: {
        mean: initialMean,
        covariance: initialCovariance
      },
      transition: transition,
      covariance: processNoise
    },
    observation: {
      stateProjection: observation,
      covariance: observationNoise
    }
  })

  const update = useCallback(
    (observation) => {
      const { mean, covariance } = kFilter.filter(state.mean, state.covariance, observation)
      setState({ mean, covariance })
    },
    [kFilter, state.mean, state.covariance]
  )

  const reset = useCallback(() => {
    setState({
      mean: initialMean,
      covariance: initialCovariance
    })
  }, [initialMean, initialCovariance])

  return { state, update, reset }
}
