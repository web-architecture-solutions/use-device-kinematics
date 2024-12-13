import { useEffect } from 'react'

import { GUI } from 'dat.gui'

export function useGUI({ parameters, dispatch }) {
  useEffect(() => {
    const gui = new GUI()
    const stepSizeController = gui.add(parameters, 'stepSize', 0.01, 1).name('Step Size')
    const maxPointsController = gui.add(parameters, 'maxPoints', 3, 50000, 1).name('Max Points')

    stepSizeController.onChange((value) => dispatch({ type: 'UPDATE_STEP_SIZE', payload: value }))
    maxPointsController.onChange((value) => dispatch({ type: 'UPDATE_MAX_POINTS', payload: value }))

    return () => gui.destroy()
  }, [parameters])
}
