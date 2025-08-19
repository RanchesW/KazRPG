// ===== src/components/ui/Toast.tsx =====
'use client'

import { toast as hotToast, Toaster as HotToaster } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export const toast = {
  success: (message: string) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-green-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-100" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-green-500">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-100 hover:text-white focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ),
      { duration: 4000 }
    )
  },

  error: (message: string) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-red-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-100" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-red-500">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-100 hover:text-white focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    )
  },

  info: (message: string) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-blue-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-blue-100" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-blue-500">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-100 hover:text-white focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ),
      { duration: 4000 }
    )
  },

  warning: (message: string) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-yellow-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-100" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-yellow-500">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-yellow-100 hover:text-white focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    )
  },
}

export function Toaster() {
  return <HotToaster position="bottom-right" />
}