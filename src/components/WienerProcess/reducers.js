export function parameterReducer(parameters, action) {
  switch (action.type) {
    case 'UPDATE_STEP_SIZE':
      return { ...parameters, stepSize: action.payload }
    case 'UPDATE_MAX_POINTS':
      return { ...parameters, maxPoints: action.payload }
    default:
      return parameters
  }
}
