// ===== src/hooks/useApi.ts =====
'use client'

import { useCallback, useState } from 'react'
import { toast } from '@/components/ui/Toast'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ApiOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>,
      options: ApiOptions = {}
    ): Promise<T | null> => {
      const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = 'Операция выполнена успешно',
      } = options

      setState({ data: null, loading: true, error: null })

      try {
        const result = await apiCall()
        
        setState({ data: result, loading: false, error: null })
        
        if (showSuccessToast) {
          toast.success(successMessage)
        }
        
        return result
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Произошла неизвестная ошибка'
        
        setState({ data: null, loading: false, error: errorMessage })
        
        if (showErrorToast) {
          toast.error(errorMessage)
        }
        
        return null
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}