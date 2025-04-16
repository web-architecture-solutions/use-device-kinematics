import { useRef, useState, useEffect, useCallback } from 'react'
import { KalmanFilter } from 'kalman-filter'

/**
 * Helper to convert a 1D array into a column vector (matrix),
 * e.g. [a, b, c] => [[a], [b], [c]]
 */
const toColumnMatrix = (arr) => arr.map((value) => [value])

/**
 * useKalmanFilter tracks incoming DeviceKinematics updates
 * and runs an online Kalman filter cycle.
 *
 * IMPORTANT: The Kalman filter instance is configured with
 *  - a state dimension of 24 (from deviceKinematics.stateVector), and
 *  - an observation model expecting a measurement vector of 12.
 *
 * To satisfy these, we pass in the flattened measuredVariables (position, acceleration,
 * orientation, angularVelocity) which is 4 * 3 = 12 numbers.
 */
export default function useKalmanFilter(deviceKinematics) {
  const filterRef = useRef(null)
  // We start with previousCorrected set to null (the library's signal to use dynamic.init)
  const previousCorrectedRef = useRef(null)
  // Holds the filtered state returned by the Kalman filter (a valid "State" instance)
  const [filteredState, setFilteredState] = useState(null)
  // An array to track each observation (as a column vector)
  const [observations, setObservations] = useState([])

  // Initialize the Kalman filter when the DeviceKinematics configuration changes.
  useEffect(() => {
    filterRef.current = new KalmanFilter({
      dynamic: {
        init: {
          // Use the full state as initial mean (24 x 1 column vector)
          mean: toColumnMatrix(deviceKinematics.stateVector),
          covariance: deviceKinematics.processNoiseMatrix
        },
        transition: deviceKinematics.stateTransitionMatrix,
        covariance: deviceKinematics.processNoiseMatrix
      },
      observation: {
        stateProjection: deviceKinematics.observationMatrix,
        covariance: deviceKinematics.observationNoiseMatrix
      }
    })
    // Reset internal state so that the first observation will properly initialize the filter.
    previousCorrectedRef.current = null
    setObservations([])
    setFilteredState(null)
  }, [deviceKinematics])

  // Process each new update from deviceKinematics as a new observation.
  useEffect(() => {
    // Instead of the full stateVector (24 numbers), extract measured variables (12 numbers):
    // measuredVariables is assumed to be an array of 4 items (position, acceleration, orientation,
    // angularVelocity), each an array of length 3.
    const measuredObservation = deviceKinematics.measuredVariables.flat()
    const newObservation = toColumnMatrix(measuredObservation) // becomes 12 x 1 matrix
    setObservations((prev) => [...prev, newObservation])

    // Use the online Kalman filter API.
    // On the first call, previousCorrected is null so that the filter uses dynamic.init.
    const corrected = filterRef.current.filter({
      previousCorrected: previousCorrectedRef.current,
      observation: newObservation
    })

    // Save the corrected state for the next update.
    previousCorrectedRef.current = corrected
    setFilteredState(corrected)
  }, [deviceKinematics])

  // Optional: Provide a reset function to clear the filter state.
  const reset = useCallback(() => {
    previousCorrectedRef.current = null
    setFilteredState(null)
    setObservations([])
  }, [deviceKinematics])

  return { state: filteredState, observations, reset }
}
