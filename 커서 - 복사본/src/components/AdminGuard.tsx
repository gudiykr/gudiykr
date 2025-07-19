'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    try {
      const user = JSON.parse(userStr)
      
      // 관리자 권한 체크 (userType이 'admin'이거나 특정 이메일)
      if (user.userType === 'admin' || user.email === 'admin@guidy.com') {
        setIsAuthorized(true)
      } else {
        alert('관리자 권한이 필요합니다.')
        router.push('/')
      }
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error)
      alert('로그인 정보를 확인할 수 없습니다.')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">권한 확인 중...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
} 