import Edge from './Edge'

import { edges } from '../constants'

export default function UnitCube() {
  return (
    <group>
      {edges.map(([start, end], index) => (
        <Edge key={index} start={start} end={end} />
      ))}
    </group>
  )
}
