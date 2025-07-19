'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  userType: 'customer' | 'guide' | 'admin'
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGuideModal, setShowGuideModal] = useState(false)

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const handleGuideApply = () => {
    // 탈리폼 링크를 새 탭에서 열기
    window.open('https://tally.so/r/wapxR9', '_blank')
    setShowGuideModal(false)
  }

  if (loading) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Guidy
            </Link>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Guidy
            </Link>
            <nav className="flex space-x-4 items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    안녕하세요, {user.name}님
                  </span>
                  <Link 
                    href="/bookings" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    예약내역
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowGuideModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    가이드로 참여하기
                  </button>
                  <Link 
                    href="/login" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    로그인
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 가이드 신청 모달 */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">가이드 신청</h2>
            <p className="text-gray-600 mb-6">
              가이드로 참여하시려면 탈리폼을 작성해주세요. 
              아래 버튼을 클릭하면 신청 폼으로 이동합니다.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={handleGuideApply}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                신청하기
              </button>
                              <button
                  onClick={() => {
                    setShowGuideModal(false)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 