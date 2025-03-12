import { vertices, edges } from './constants'

import EmbeddedLine from '../EmbeddedLine'

export default function UnitCube() {
  return (
    <group>
      {edges.map(([start, end], index) => {
        const startVertex = vertices[start]
        const endVertex = vertices[end]
        const positions = [...startVertex, ...endVertex]
        return <EmbeddedLine key={index} positions={positions} />
      })}
    </group>
  )
}
