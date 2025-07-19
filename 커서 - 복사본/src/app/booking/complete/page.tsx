'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Booking, Guide } from '@/types'
import { getBookingById, getGuideById } from '@/lib/firebaseService'

export default function BookingCompletePage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      const bookingData = await getBookingById(bookingId!)
      if (bookingData) {
        setBooking(bookingData)
        
        // 가이드 정보도 로드
        const guideData = await getGuideById(bookingData.guideId)
        setGuide(guideData)
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
              href="/booking"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              예약 페이지로 돌아가기
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
              <Link href="/booking" className="text-gray-500 hover:text-gray-900">
                예약하기
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 성공 메시지 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">예약이 완료되었습니다!</h1>
            <p className="text-gray-600">예약 정보는 아래와 같습니다.</p>
          </div>
        </div>

        {/* 예약 상세 정보 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">예약 상세 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">예약 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">예약 번호</span>
                  <span className="font-medium">{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예약 상태</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
              </div>
            </div>

            {/* 가이드 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">가이드 정보</h3>
              {guide ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">가이드 이름</span>
                    <span className="font-medium">{guide.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평점</span>
                    <span className="font-medium">★ {guide.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 예약 수</span>
                    <span className="font-medium">{guide.totalBookings}회</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-2">전문 분야</span>
                    <div className="flex flex-wrap gap-2">
                      {guide.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-2">소개</span>
                    <p className="text-sm text-gray-700">{guide.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">가이드 정보를 불러올 수 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 다음 단계 안내 */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">다음 단계</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>• 가이드가 예약을 확인하면 알림을 받으실 수 있습니다.</p>
            <p>• 예약 확정 후 가이드와 연락 방법을 안내드립니다.</p>
            <p>• 예약 변경이나 취소가 필요한 경우 고객센터로 연락해주세요.</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/booking"
            className="flex-1 bg-gray-600 text-white text-center py-3 px-6 rounded-md font-medium hover:bg-gray-700 transition-colors"
          >
            추가 예약하기
          </Link>
        </div>
      </div>
    </div>
  )
} 