'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'

interface TimeSlot {
  startTime: string
  endTime: string
  maxParticipants: number
}

interface AvailableDate {
  date: string
  timeSlots: TimeSlot[]
}

interface Tour {
  id: number
  title: string
  description: string
  price: number
  duration: string
  details: string[]
  image: string
  guideId: string
  guideName: string
  guideDescription: string
  guideImage?: string
  guideRating: number
  guideSpecialties: string[]
  availableDates: AvailableDate[]
  images: string[] // Added images to Tour interface
  maxParticipants?: number // Added maxParticipants to Tour interface
  guideLanguage?: string // Added guideLanguage to Tour interface
}

interface User {
  id: string
  email: string
  name: string
  userType: 'traveler' | 'guide' | 'admin'
}

export default function TourDetailPage() {
  const params = useParams()
  const tourId = params.id
  const [tour, setTour] = useState<Tour | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [participants, setParticipants] = useState(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('09:00')
  const [newEndTime, setNewEndTime] = useState('12:00')
  const [newMaxParticipants, setNewMaxParticipants] = useState(5)
  const [mainImageIdx, setMainImageIdx] = useState(0)

  useEffect(() => {
    loadTour()
    checkUserRole()
    setMainImageIdx(0)
  }, [tourId])

  const loadTour = async () => {
    try {
      const response = await fetch('/api/tours')
      const data = await response.json()
      
      if (response.ok) {
        const foundTour = data.tours.find((t: Tour) => t.id === Number(tourId))
        setTour(foundTour || null)
      }
    } catch (error) {
      console.error('투어 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserRole = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
        setIsAdmin(user.userType === 'admin')
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error)
      }
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleBooking = async () => {
    if (!tour || !selectedDate || !selectedTimeSlot) {
      alert('날짜와 시간을 선택해주세요.')
      return
    }

    // 로그인 상태 확인
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      alert('예약을 하려면 로그인이 필요합니다.')
      return
    }

    try {
      const user = JSON.parse(userData)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId: tour.id,
          tourTitle: tour.title,
          guideId: tour.guideId,
          guideName: tour.guideName,
          travelerId: String(user.id),
          travelerName: user.name,
          date: selectedDate,
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          participants,
          totalPrice: tour.price * participants,
          status: 'pending'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('예약이 완료되었습니다!')
        setSelectedDate('')
        setSelectedTimeSlot(null)
        setParticipants(1)
      } else {
        alert(data.error || '예약 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('예약 오류:', error)
      alert('예약 중 오류가 발생했습니다.')
    }
  }

  const addAvailableDate = () => {
    setShowDateModal(true)
  }

  const handleAddDate = async () => {
    if (!tour || !newDate) {
      alert('날짜를 선택해주세요.')
      return
    }

    const newTimeSlot = {
      startTime: newStartTime,
      endTime: newEndTime,
      maxParticipants: newMaxParticipants
    }

    const updatedTour = {
      ...tour,
      availableDates: [
        ...tour.availableDates,
        {
          date: newDate,
          timeSlots: [newTimeSlot]
        }
      ]
    }

    try {
      const response = await fetch(`/api/tours/${tour.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTour),
      })

      if (response.ok) {
        setTour(updatedTour)
        setShowDateModal(false)
        setNewDate('')
        setNewStartTime('09:00')
        setNewEndTime('12:00')
        setNewMaxParticipants(5)
        alert('예약 가능한 날짜가 추가되었습니다.')
      } else {
        alert('예약 가능한 날짜 추가 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('예약 가능한 날짜 추가 오류:', error)
      alert('예약 가능한 날짜 추가 중 오류가 발생했습니다.')
    }
  }

  const removeAvailableDate = async (dateToRemove: string) => {
    if (!tour) return

    if (!confirm(`정말로 ${dateToRemove} 날짜를 삭제하시겠습니까?`)) return

    const updatedTour = {
      ...tour,
      availableDates: tour.availableDates.filter(date => date.date !== dateToRemove)
    }

    try {
      const response = await fetch(`/api/tours/${tour.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTour),
      })

      if (response.ok) {
        setTour(updatedTour)
        alert('예약 가능한 날짜가 삭제되었습니다.')
      } else {
        alert('예약 가능한 날짜 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('예약 가능한 날짜 삭제 오류:', error)
      alert('예약 가능한 날짜 삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">투어 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">투어를 찾을 수 없습니다</h1>
            <p className="text-gray-600">요청하신 투어가 존재하지 않습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  // 안전한 이미지 배열 생성 (빈 값/undefined/null 필터)
  const images = (Array.isArray(tour?.images) ? tour.images : (tour?.image ? [tour.image] : []))
    .filter((img) => typeof img === 'string' && img.trim() !== '')
  const safeMainIdx = images[mainImageIdx] ? mainImageIdx : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* 투어 제목 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{tour.title}</h1>
          <p className="text-gray-600 text-xl">{tour.description}</p>
        </div>

        {/* 이미지 슬라이드 */}
        <div className="mb-8">
          {images.length > 0 ? (
            <>
              <img
                src={images[safeMainIdx]}
                alt={tour?.title}
                className="w-full aspect-[3/4] object-cover rounded-lg border mb-4"
              />
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt="썸네일"
                    className={`w-20 h-20 object-cover rounded border cursor-pointer flex-shrink-0 ${safeMainIdx === idx ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setMainImageIdx(idx)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gray-200 rounded-lg">
              <span className="text-gray-500">이미지 준비중</span>
            </div>
          )}
        </div>

        {/* 예약 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isAdmin ? '예약 관리' : '예약하기'}
          </h2>
          
          {isAdmin ? (
            // 관리자용 예약 관리 인터페이스
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">예약 가능한 날짜</h3>
                <div className="space-y-2">
                  {tour.availableDates.map((availableDate, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{availableDate.date}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {availableDate.timeSlots.map((slot, slotIndex) => (
                              <span key={slotIndex} className="mr-2">
                                {slot.startTime}-{slot.endTime} (최대 {slot.maxParticipants}명)
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => removeAvailableDate(availableDate.date)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={addAvailableDate}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
              >
                예약 가능한 날짜 추가
              </button>
            </div>
          ) : (
            // 일반 사용자용 예약 인터페이스
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예약 가능한 날짜
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">날짜 선택</option>
                  {tour.availableDates.map((availableDate, index) => (
                    <option key={index} value={availableDate.date}>
                      {availableDate.date}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시간 선택
                  </label>
                  <div className="space-y-2">
                    {tour.availableDates
                      .find(date => date.date === selectedDate)
                      ?.timeSlots.map((timeSlot, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSlotSelect(timeSlot)}
                          className={`w-full p-3 text-left rounded-md border transition-colors ${
                            selectedTimeSlot === timeSlot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
                            <span className="text-sm">최대 {timeSlot.maxParticipants}명</span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {selectedTimeSlot && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      참가 인원
                    </label>
                    <select
                      value={participants}
                      onChange={(e) => setParticipants(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: Math.min(selectedTimeSlot.maxParticipants, 10) }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num}명</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">예약 정보 요약</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">투어:</span>
                        <span className="font-medium">{tour.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">날짜:</span>
                        <span className="font-medium">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">시간:</span>
                        <span className="font-medium">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">참가 인원:</span>
                        <span className="font-medium">{participants}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 가격:</span>
                        <span className="font-bold text-blue-600">₩{(tour.price * participants).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    예약하기
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* 가이드 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">가이드 정보</h2>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              {tour.guideImage ? (
                <img 
                  src={tour.guideImage} 
                  alt={tour.guideName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.style.display = 'none';
                    const fallback = img.parentElement?.querySelector('.guide-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-blue-600 flex items-center justify-center guide-fallback">
                  <span className="text-white font-bold text-2xl">{tour.guideName.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{tour.guideName}</h3>
              <pre className="text-gray-600 text-lg whitespace-pre-line">{tour.guideDescription}</pre>
            </div>
          </div>
        </div>

        {/* 투어 정보 및 상세 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">투어 정보</h2>
          
          {/* 투어 기본 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">₩{tour.price.toLocaleString()}</div>
              <div className="text-sm text-gray-500">1인당</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{tour.duration}</div>
              <div className="text-sm text-gray-500">소요시간</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{tour.maxParticipants || 10}명</div>
              <div className="text-sm text-gray-500">최대인원</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{tour.guideLanguage || '한국어'}</div>
              <div className="text-sm text-gray-500">가이드 언어</div>
            </div>
          </div>

          {/* 투어 상세 정보 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">투어 상세 정보</h3>
            <div>
              {tour.details.map((detail, index) => (
                detail.split('\n').map((line, idx) => (
                  <div key={index + '-' + idx} className="mb-2 min-h-[1.5em]">
                    <p className="text-gray-700 text-lg">{line === '' ? '\u00A0' : line}</p>
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 날짜 추가 모달 */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">예약 가능한 날짜 추가</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">최대 참가 인원</label>
                <input
                  type="number"
                  value={newMaxParticipants}
                  onChange={(e) => setNewMaxParticipants(Number(e.target.value))}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDateModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAddDate}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 