'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Guide, TimeSlot, Booking } from '@/types'
import { 
  getGuidesByUserId, 
  getTimeSlotsByGuideId,
  getBookingsByUserId 
} from '@/lib/firebaseService'
import CalendarTimeSlot from '@/components/CalendarTimeSlot'

export default function GuideDashboard() {
  const router = useRouter()
  const [guides, setGuides] = useState<Guide[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGuide, setSelectedGuide] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'bookings'>('calendar')
  
  // 새로운 시간대 추가 폼
  const [newTimeSlot, setNewTimeSlot] = useState({
    date: '',
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    // 실제로는 로그인된 사용자 ID를 사용해야 함
    const userId = 'current-user-id' // 임시 사용자 ID
    loadGuideData(userId)
  }, [])

  const loadGuideData = async (userId: string) => {
    try {
      const userGuides = await getGuidesByUserId(userId)
      setGuides(userGuides)
      
      if (userGuides.length > 0) {
        setSelectedGuide(userGuides[0].id)
        await loadTimeSlotsAndBookings(userGuides[0].id)
      }
    } catch (error) {
      console.error('가이드 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTimeSlotsAndBookings = async (guideId: string) => {
    try {
      const [timeSlotsData, bookingsData] = await Promise.all([
        getTimeSlotsByGuideId(guideId),
        getBookingsByUserId(guideId, 'guide')
      ])
      
      setTimeSlots(timeSlotsData)
      setBookings(bookingsData)
    } catch (error) {
      console.error('시간대 및 예약 데이터 로드 오류:', error)
    }
  }

  const handleAddTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedGuide || !newTimeSlot.date || !newTimeSlot.startTime || !newTimeSlot.endTime) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    try {
      await createTimeSlot({
        guideId: selectedGuide,
        date: newTimeSlot.date,
        startTime: newTimeSlot.startTime,
        endTime: newTimeSlot.endTime,
        isBooked: false
      })

      // 폼 초기화
      setNewTimeSlot({ date: '', startTime: '', endTime: '' })
      
      // 시간대 목록 새로고침
      await loadTimeSlotsAndBookings(selectedGuide)
      
      alert('시간대가 추가되었습니다.')
    } catch (error) {
      console.error('시간대 추가 오류:', error)
      alert('시간대 추가 중 오류가 발생했습니다.')
    }
  }

  const handleTimeSlotAdded = async () => {
    if (selectedGuide) {
      await loadTimeSlotsAndBookings(selectedGuide)
    }
  }

  const handleGuideChange = async (guideId: string) => {
    setSelectedGuide(guideId)
    await loadTimeSlotsAndBookings(guideId)
  }

  const handleBookingClick = (bookingId: string) => {
    router.push(`/guide/booking/${bookingId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">가이드 대시보드</h1>
          <p className="text-gray-600">가능한 시간대를 등록하고 예약을 관리하세요.</p>
        </div>

        {/* 가이드 선택 */}
        {guides.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">가이드 선택</h2>
            <select
              value={selectedGuide}
              onChange={(e) => handleGuideChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {guides.map(guide => (
                <option key={guide.id} value={guide.id}>
                  {guide.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                캘린더로 등록
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                목록으로 관리
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                예약 관리
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'calendar' && selectedGuide && (
              <CalendarTimeSlot 
                guideId={selectedGuide} 
                onTimeSlotAdded={handleTimeSlotAdded}
              />
            )}

            {activeTab === 'list' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">등록된 시간대 목록</h2>
                {timeSlots.length === 0 ? (
                  <p className="text-gray-500">등록된 시간대가 없습니다.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            날짜
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            시간
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            상태
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {timeSlots.map((slot) => (
                          <tr key={slot.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {format(new Date(slot.date), 'yyyy년 MM월 dd일')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {slot.startTime} - {slot.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                slot.isBooked 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {slot.isBooked ? '예약됨' : '예약 가능'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">예약 목록</h2>
                {bookings.length === 0 ? (
                  <p className="text-gray-500">예약이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleBookingClick(booking.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {format(new Date(booking.date), 'yyyy년 MM월 dd일')} {booking.startTime} - {booking.endTime}
                            </p>
                            <p className="text-sm text-gray-600">예약자 ID: {booking.travelerId}</p>
                            <p className="text-sm text-gray-600">총 금액: ₩{booking.totalPrice.toLocaleString()}</p>
                          </div>
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
                        <p className="text-xs text-gray-500 mt-2">클릭하여 상세 정보 보기</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 