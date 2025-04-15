import MatrixTable from '../MatrixTable'
import VectorTable from '../VectorTable'

export default function DeviceKinematics({ deviceKinematics }) {
  return (
    <section>
      <h2>Device Kinematics</h2>

      <h3>State Vector</h3>

      <VectorTable variables={deviceKinematics.variables} vector={deviceKinematics.stateVector} />

      <h3>State Transition Matrix</h3>

      <MatrixTable variables={deviceKinematics.variables} matrix={deviceKinematics.stateTransitionMatrix} />

      <h3>Observation Matrix</h3>

      <MatrixTable variables={deviceKinematics.variables} matrix={deviceKinematics.observationMatrix} />
    </section>
  )
}
