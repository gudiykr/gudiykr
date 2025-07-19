'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'

interface User {
  id: string | number
  name: string
  email: string
  userType: string
  birthYear?: string | number
  gender?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    try {
      const user = JSON.parse(userData)
      if (user.userType !== 'admin') {
        alert('관리자만 접근할 수 있습니다.')
        router.push('/')
        return
      }
      setIsAdmin(true)
      fetchUsers()
    } catch (e) {
      router.push('/login')
    }
  }, [router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (e) {
      alert('회원 정보를 불러오는 데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">회원 관리</h2>
        {loading ? (
          <div className="text-center py-12">회원 정보를 불러오는 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">이름</th>
                  <th className="px-4 py-2 border-b text-left">이메일</th>
                  <th className="px-4 py-2 border-b text-left">권한</th>
                  <th className="px-4 py-2 border-b text-left">성별</th>
                  <th className="px-4 py-2 border-b text-left">태어난 연도</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.userType}</td>
                    <td className="px-4 py-2">{user.gender || '-'}</td>
                    <td className="px-4 py-2">{user.birthYear || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 