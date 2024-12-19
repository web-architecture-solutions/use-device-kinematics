import { useReducer } from 'react'

import { useFrame } from '@react-three/fiber'

import { GlitchContext } from '../../context'

import { reducer } from './reducers'

const initialState = {
  isGlitched: false,
  delay: 240,
  duration: 30
}

export default function GlitchComposer({
  children,
  delay: maxDelay = 240,
  duration: maxDuration = 30,
  disabled = false,
  randomizeDelay = false,
  randomizeDuration = false
}) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useFrame(() => {
    if (disabled) return

    if (state.delay > 0) {
      dispatch({ type: 'DECREMENT_DELAY' })
    } else if (state.duration > 0) {
      dispatch({ type: 'DECREMENT_DURATION' })
    } else {
      dispatch({
        type: 'RESET',
        delay: randomizeDelay ? Math.random() * maxDelay : delay,
        duration: randomizeDuration ? Math.random() * maxDuration : duration
      })
    }
  })

  return <GlitchContext.Provider value={state.isGlitched}>{children}</GlitchContext.Provider>
}
