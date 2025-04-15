export function stringifyArray(array) {
    function elementsToStrings(value, index) {
      return `${index === 0 ? "" : " "}${value === null ? "null" : value}`
    }
    
    return `[${array.map(elementsToStrings)}]`
  }