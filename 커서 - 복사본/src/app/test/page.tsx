'use client'

import { useState } from 'react'

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const initializeData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult('초기 데이터가 성공적으로 생성되었습니다!')
      } else {
        setResult('오류: ' + data.error)
      }
    } catch (error) {
      setResult('오류: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">초기 데이터 생성</h1>
        
        <button
          onClick={initializeData}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? '생성 중...' : '초기 데이터 생성'}
        </button>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <p className="text-gray-700">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
} 