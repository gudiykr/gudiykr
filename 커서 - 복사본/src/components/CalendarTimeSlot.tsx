'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { createTimeSlot, getTimeSlotsByGuideId } from '@/lib/firebaseService'
import { TimeSlot } from '@/types'

interface CalendarTimeSlotProps {
  guideId: string
  onTimeSlotAdded?: () => void
}

export default function CalendarTimeSlot({ guideId, onTimeSlotAdded }: CalendarTimeSlotProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedStartTime, setSelectedStartTime] = useState('')
  const [selectedEndTime, setSelectedEndTime] = useState('')
  const [existingTimeSlots, setExistingTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  // 시간 옵션 (30분 단위)
  const timeOptions = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ]

  useEffect(() => {
    loadExistingTimeSlots()
  }, [guideId])

  const loadExistingTimeSlots = async () => {
    try {
      const timeSlots = await getTimeSlotsByGuideId(guideId)
      setExistingTimeSlots(timeSlots)
    } catch (error) {
      console.error('기존 시간대 로드 오류:', error)
    }
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }

  const getPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const getNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedStartTime('')
    setSelectedEndTime('')
  }

  const handleTimeSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      alert('날짜와 시간을 모두 선택해주세요.')
      return
    }

    if (selectedStartTime >= selectedEndTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    setLoading(true)

    try {
      await createTimeSlot({
        guideId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        isBooked: false
      })

      // 폼 초기화
      setSelectedStartTime('')
      setSelectedEndTime('')
      
      // 기존 시간대 목록 새로고침
      await loadExistingTimeSlots()
      
      // 콜백 호출
      if (onTimeSlotAdded) {
        onTimeSlotAdded()
      }

      alert('시간대가 성공적으로 등록되었습니다.')
    } catch (error) {
      console.error('시간대 등록 오류:', error)
      alert('시간대 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getTimeSlotsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return existingTimeSlots.filter(slot => slot.date === dateString)
  }

  const isDateSelected = (date: Date) => {
    return selectedDate && isSameDay(date, selectedDate)
  }

  const isDateInPast = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">시간대 등록</h2>
        <p className="text-gray-600">달력에서 날짜를 선택하고 시간대를 등록하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 캘린더 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={getPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'yyyy년 MM월', { locale: ko })}
            </h3>
            <button
              onClick={getNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              const timeSlotsForDate = getTimeSlotsForDate(date)
              const hasTimeSlots = timeSlotsForDate.length > 0
              const isPast = isDateInPast(date)
              const isSelected = isDateSelected(date)

              return (
                <button
                  key={index}
                  onClick={() => !isPast && handleDateClick(date)}
                  disabled={isPast}
                  className={`
                    p-2 text-sm rounded-md transition-colors relative
                    ${isPast 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'hover:bg-blue-50 cursor-pointer'
                    }
                    ${isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-900'}
                  `}
                >
                  <span className="block">{format(date, 'd')}</span>
                  {hasTimeSlots && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 시간대 선택 폼 */}
        <div>
          {selectedDate ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })} 시간대 등록
              </h3>
              
              <form onSubmit={handleTimeSlotSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작 시간
                    </label>
                    <select
                      value={selectedStartTime}
                      onChange={(e) => setSelectedStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">시간 선택</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료 시간
                    </label>
                    <select
                      value={selectedEndTime}
                      onChange={(e) => setSelectedEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">시간 선택</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '등록 중...' : '시간대 등록'}
                </button>
              </form>

              {/* 선택된 날짜의 기존 시간대 표시 */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">등록된 시간대</h4>
                {(() => {
                  const timeSlotsForDate = getTimeSlotsForDate(selectedDate)
                  if (timeSlotsForDate.length === 0) {
                    return <p className="text-sm text-gray-500">등록된 시간대가 없습니다.</p>
                  }
                  return (
                    <div className="space-y-2">
                      {timeSlotsForDate.map(slot => (
                        <div key={slot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span className="text-sm">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            slot.isBooked 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {slot.isBooked ? '예약됨' : '예약 가능'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>달력에서 날짜를 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 