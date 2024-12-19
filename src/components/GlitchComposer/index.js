import { useReducer } from 'react'

import { useFrame } from '@react-three/fiber'

import { GlitchContext } from '../../context'

import { reducer } from './reducers'

export default function GlitchComposer({
  children,
  delay = 240,
  duration = 30,
  disabled = false,
  randomizeDelay = false,
  randomizeDuration = false
}) {
  const [state, dispatch] = useReducer(reducer, {
    delay,
    duration,
    isGlitched: false
  })

  useFrame(() => {
    if (disabled) return

    if (state.delay > 0) {
      dispatch({ type: 'DECREMENT_DELAY' })
    } else if (state.duration > 0) {
      dispatch({ type: 'DECREMENT_DURATION' })
    } else {
      dispatch({
        type: 'RESET',
        delay: randomizeDelay ? Math.random() * delay : delay,
        duration: randomizeDuration ? Math.random() * duration : duration
      })
    }
  })

  return <GlitchContext.Provider value={state.isGlitched}>{children}</GlitchContext.Provider>
}
