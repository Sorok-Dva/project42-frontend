import { useError } from '../contexts/ErrorContext'

const useGlobalErrorHandler = () => {
  const { setServerError } = useError()

  const handleError = (error: Error) => {
    const errorCode = error.message.includes('500') || error.message.includes('503')
    if (errorCode) {
      setServerError(true)
    } else {
      setServerError(false)
    }
  }

  return handleError
}

export default useGlobalErrorHandler
