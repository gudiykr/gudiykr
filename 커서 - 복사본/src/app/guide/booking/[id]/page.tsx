'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Booking, Guide, User } from '@/types'
import { getBookingById, getGuideById, getUserById, updateBookingStatus } from '@/lib/firebaseService'

export default function GuideBookingDetailPage() {
  const params = useParams()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [traveler, setTraveler] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails()
    } else {
      setError('예약 정보를 찾을 수 없습니다.')
      setLoading(false)
    }
  }, [bookingId])

  const loadBookingDetails = async () => {
    try {
      const bookingData = await getBookingById(bookingId)
      if (bookingData) {
        setBooking(bookingData)
        
        // 가이드와 여행객 정보도 로드
        const [guideData, travelerData] = await Promise.all([
          getGuideById(bookingData.guideId),
          getUserById(bookingData.travelerId)
        ])
        
        setGuide(guideData)
        setTraveler(travelerData)
      } else {
        setError('예약 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('예약 정보 로드 오류:', error)
      setError('예약 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: Booking['status']) => {
    if (!booking) return

    setUpdating(true)
    try {
      await updateBookingStatus(booking.id, newStatus)
      setBooking({ ...booking, status: newStatus })
      alert('예약 상태가 업데이트되었습니다.')
    } catch (error) {
      console.error('상태 업데이트 오류:', error)
      alert('상태 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">오류</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/guide/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Guidy
            </Link>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900">
                홈
              </Link>
              <Link href="/guide/dashboard" className="text-blue-600 font-medium">
                가이드 대시보드
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 예약 정보 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 상세 정보</h1>
              <p className="text-gray-600">예약 번호: {booking.id}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {booking.status === 'confirmed' ? '확정' :
                 booking.status === 'pending' ? '대기중' :
                 booking.status === 'cancelled' ? '취소됨' : '완료'}
              </span>
            </div>
          </div>
        </div>

        {/* 예약 상세 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 예약 정보 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">예약 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">예약 날짜</span>
                <span className="font-medium">
                  {format(new Date(booking.date), 'yyyy년 MM월 dd일', { locale: ko })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예약 시간</span>
                <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 금액</span>
                <span className="font-medium text-blue-600">₩{booking.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예약 일시</span>
                <span className="font-medium">
                  {format(new Date(booking.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                </span>
              </div>
              {booking.notes && (
                <div>
                  <span className="text-gray-600 block mb-2">특이사항</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* 여행객 정보 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">여행객 정보</h2>
            {traveler ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">이름</span>
                  <span className="font-medium">{traveler.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">이메일</span>
                  <span className="font-medium">{traveler.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">가입일</span>
                  <span className="font-medium">
                    {format(new Date(traveler.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">여행객 정보를 불러올 수 없습니다.</p>
            )}
          </div>
        </div>

        {/* 상태 업데이트 */}
        {booking.status === 'pending' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">예약 상태 업데이트</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={updating}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? '처리 중...' : '예약 확정'}
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={updating}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? '처리 중...' : '예약 거절'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              예약을 확정하면 여행객에게 알림이 전송됩니다.
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/guide/dashboard"
            className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            대시보드로 돌아가기
          </Link>
          <Link
            href="/booking"
            className="flex-1 bg-gray-600 text-white text-center py-3 px-6 rounded-md font-medium hover:bg-gray-700 transition-colors"
          >
            다른 예약 보기
          </Link>
        </div>
      </div>
    </div>
  )
} 