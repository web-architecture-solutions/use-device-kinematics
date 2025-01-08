export const useKalmanFilter2D = (config) => {
  const [state, setState] = useState({
    mean: config.initialMean, // Initial state mean: [x, v_x, a_x, j_x, y, v_y, a_y, j_y, k_x, k_y]
    covariance: config.initialCovariance
  })

  const kFilter = new KalmanFilter({
    dynamic: {
      init: {
        mean: config.initialMean,
        covariance: config.initialCovariance
      },
      transition: config.transition, // Updated for 2D
      covariance: config.processNoise
    },
    observation: {
      stateProjection: config.observation, // Updated for 2D
      covariance: config.observationNoise
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
      mean: config.initialMean,
      covariance: config.initialCovariance
    })
  }, [config.initialMean, config.initialCovariance])

  return { state, update, reset }
}
