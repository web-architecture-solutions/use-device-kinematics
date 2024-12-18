import Edge from '../Edge'

import { edges, vertices, vertexColors } from './constants'

export default function UnitCube() {
  return (
    <group>
      {edges.map(([start, end], index) => (
        <Edge
          key={index}
          startVertex={vertices[start]}
          endVertex={vertices[end]}
          startColor={vertexColors[start]}
          endColor={vertexColors[end]}
        />
      ))}
    </group>
  )
}
