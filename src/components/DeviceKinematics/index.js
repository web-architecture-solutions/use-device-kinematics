import MatrixTable from '../MatrixTable'
import VectorTable from '../VectorTable'

const emsPerCell = 7

export default function DeviceKinematics({ deviceKinematics }) {
  return (
    <section>
      <h2>Device Kinematics</h2>

      <h3>State Vector</h3>

      <VectorTable variables={deviceKinematics.variables} vector={deviceKinematics.stateVector} emsPerCell={emsPerCell} />

      <h3>Generic Kinematics Matrix</h3>

      <MatrixTable variables={deviceKinematics.variables.slice(0, 4)} matrix={deviceKinematics.kinematicsMatrix} emsPerCell={emsPerCell} />

      <h3>Lever-Arm Effect Matrix</h3>

      <MatrixTable
        variables={deviceKinematics.variables.slice(0, 4)}
        matrix={deviceKinematics.leverArmEffectMatrix}
        emsPerCell={emsPerCell}
      />

      <h3>Coriolis Effect Matrix</h3>

      <MatrixTable
        variables={deviceKinematics.variables.slice(0, 4)}
        matrix={deviceKinematics.coriolisEffectMatrix}
        emsPerCell={emsPerCell}
      />

      <h3>State Transition Matrix</h3>

      <MatrixTable variables={deviceKinematics.variables} matrix={deviceKinematics.stateTransitionMatrix} emsPerCell={emsPerCell} />

      <h3>Observation Matrix</h3>

      <MatrixTable variables={deviceKinematics.variables} matrix={deviceKinematics.observationMatrix} emsPerCell={emsPerCell} />

      <h3>Observation Noise Matrix</h3>

      <MatrixTable
        variables={deviceKinematics.variables.slice(0, 4)}
        matrix={deviceKinematics.observationNoiseMatrix}
        emsPerCell={emsPerCell}
      />
    </section>
  )
}
