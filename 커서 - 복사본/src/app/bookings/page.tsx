'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface User {
  id: string
  email: string
  name: string
  userType: 'traveler' | 'guide' | 'admin'
}

interface Booking {
  id: string
  tourId: number
  tourTitle: string
  guideId: string
  guideName: string
  travelerId: string
  travelerName: string
  date: string
  startTime: string
  endTime: string
  participants: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

export default function BookingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      setUser(user)
      loadBookings(user)
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error)
      router.push('/login')
    }
  }, [router])

  const loadBookings = async (user: User) => {
    try {
      console.log('예약 내역 로드 시작:', user)
      
      // userType을 role로 매핑
      const role = user.userType === 'admin' ? 'admin' : 'customer'
      console.log('매핑된 역할:', role)
      
      const response = await fetch(`/api/bookings?userId=${user.id}&role=${role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      console.log('API 응답 상태:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('받은 예약 데이터:', data)
        setBookings(data.bookings || [])
      } else {
        const errorData = await response.json()
        console.error('예약 내역 로드 실패:', errorData)
      }
    } catch (error) {
      console.error('예약 내역 로드 오류:', error)
    } finally {
      console.log('로딩 상태 해제')
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중'
      case 'confirmed':
        return '확정됨'
      case 'completed':
        return '완료됨'
      case 'cancelled':
        return '취소됨'
      default:
        return status
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    // 삭제하려는 예약 찾기
    const bookingToDelete = bookings.find(booking => booking.id === bookingId)
    
    if (!bookingToDelete) {
      alert('예약을 찾을 수 없습니다.')
      return
    }

    // 확정된 예약은 삭제 불가
    if (bookingToDelete.status === 'confirmed') {
      alert('확정된 예약은 삭제할 수 없습니다.')
      return
    }

    if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-user-id': user?.id || '',
          'x-user-type': user?.userType || ''
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('삭제된 예약:', data.deletedBooking)
        
        // 삭제 성공 시 예약 목록에서 제거
        setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId))
        alert('예약이 삭제되었습니다.')
        
        // 잠시 후 예약 목록을 다시 로드하여 최신 상태 유지
        setTimeout(() => {
          if (user) {
            loadBookings(user)
          }
        }, 100)
      } else {
        const data = await response.json()
        alert(data.error || '예약 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('예약 삭제 오류:', error)
      alert('예약 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    const statusText = newStatus === 'confirmed' ? '확정' : '거절'
    if (!confirm(`정말로 이 예약을 ${statusText}하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('업데이트된 예약:', data.booking)
        
        // 상태 업데이트 성공 시 예약 목록 업데이트
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: newStatus }
              : booking
          )
        )
        alert(`예약이 ${statusText}되었습니다.`)
        
        // 잠시 후 예약 목록을 다시 로드하여 최신 상태 유지
        setTimeout(() => {
          if (user) {
            loadBookings(user)
          }
        }, 100)
      } else {
        const data = await response.json()
        alert(data.error || `예약 ${statusText} 중 오류가 발생했습니다.`)
      }
    } catch (error) {
      console.error('예약 상태 업데이트 오류:', error)
      alert(`예약 ${statusText} 중 오류가 발생했습니다.`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">예약 내역을 불러오는 중...</p>
            <button 
              onClick={() => setLoading(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              로딩 강제 해제
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">예약 내역</h2>
              <p className="text-gray-600">
                {user?.userType === 'admin' && '전체 예약 내역입니다.'}
                {user?.userType !== 'admin' && '내가 예약한 투어 목록입니다.'}
              </p>
            </div>
            {user?.userType !== 'admin' && (
              <a
                href="https://tally.so/r/nWajZP"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                결제 및 예약확정
              </a>
            )}
          </div>
        </div>

        {/* 예약 목록 */}
        {/* 예약 상태 안내 메시지 */}
        {user?.userType !== 'admin' && bookings.some(b => b.status === 'pending') && (
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            결제해야 예약이 확정됩니다.<br />
            <span className="text-sm">결제 완료시 예약상태: <b>대기중</b> → <b>확정</b></span><br />
            <span className="text-xs text-gray-600">관리자의 확인까지 시간이 조금 걸릴 수 있으니 바로 바뀌지 않아도 안심하셔도 됩니다!</span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">투어명</th>
                <th className="px-4 py-2 border-b">날짜</th>
                <th className="px-4 py-2 border-b">시간</th>
                <th className="px-4 py-2 border-b">인원</th>
                <th className="px-4 py-2 border-b">상태</th>
                <th className="px-4 py-2 border-b">예약한 시간</th>
                {user?.userType === 'admin' && (
                  <>
                    <th className="px-4 py-2 border-b">예약자명</th>
                    <th className="px-4 py-2 border-b">예약자ID</th>
                  </>
                )}
                <th className="px-4 py-2 border-b">총 금액</th>
                <th className="px-4 py-2 border-b">관리</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={user?.userType === 'admin' ? 9 : 7} className="text-center py-8 text-gray-500">
                    예약 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{booking.tourTitle}</td>
                    <td className="px-4 py-2">{booking.date}</td>
                    <td className="px-4 py-2">{booking.startTime}~{booking.endTime}</td>
                    <td className="px-4 py-2">{booking.participants}</td>
                    <td className={`px-4 py-2 ${getStatusColor(booking.status)} rounded`}>{getStatusText(booking.status)}</td>
                    <td className="px-4 py-2">{booking.createdAt ? new Date(booking.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    {user?.userType === 'admin' && (
                      <>
                        <td className="px-4 py-2">{booking.travelerName}</td>
                        <td className="px-4 py-2">{booking.travelerId}</td>
                      </>
                    )}
                    <td className="px-4 py-2">₩{booking.totalPrice.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {/* 취소된 예약은 버튼 숨김, 나머지는 모두 취소 가능 */}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          예약 취소
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 