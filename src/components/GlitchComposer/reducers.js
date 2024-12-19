export const reducer = (state, action) => {
  switch (action.type) {
    case 'DECREMENT_DELAY':
      return { ...state, delay: state.delay - 1 }
    case 'DECREMENT_DURATION':
      return { ...state, duration: state.duration - 1, isGlitched: true }
    case 'RESET':
      return {
        ...state,
        isGlitched: false,
        delay: action.delay,
        duration: action.duration
      }
    default:
      throw new Error(`Unhandled action type: ${action.type}`)
  }
}
