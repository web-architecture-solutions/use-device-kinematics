import { useState } from 'react'

export default function usePrevious(initialData) {
  const [[current, previous], setData] = useState([initialData, initialData])
  const update = (newData) => setData(([oldData]) => [newData, oldData])
  return { current, previous, update }
}
