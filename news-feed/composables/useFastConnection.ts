export const useFastConnection = () => {
  if (import.meta.client && navigator.connection) {
    const connectionType = navigator.connection.effectiveType
    return connectionType === '4g' || navigator.connection.saveData === false
  }
  return true
}
