import { NextResponse } from 'next/server'
import { createGuide, createTimeSlot } from '@/lib/localDatabase'

export async function POST() {
  try {
    // 기본 가이드 데이터 생성
    const guides = [
      {
        userId: 'guide-1',
        name: '김한강',
        description: '한강 전문 가이드로, 한강의 아름다움과 역사를 소개합니다.',
        specialties: ['한강', '자연', '사진촬영'],
        rating: 4.8,
        totalBookings: 15,
        isAvailable: true
      },
      {
        userId: 'guide-2',
        name: '박야구',
        description: '야구 문화 전문 가이드로, 한국의 야구 문화를 체험할 수 있습니다.',
        specialties: ['야구', '스포츠', '문화체험'],
        rating: 4.9,
        totalBookings: 12,
        isAvailable: true
      },
      {
        userId: 'guide-3',
        name: '이익선',
        description: '익선동 맛집 전문 가이드로, 숨겨진 맛집들을 소개합니다.',
        specialties: ['맛집', '전통시장', '한식'],
        rating: 4.7,
        totalBookings: 18,
        isAvailable: true
      }
    ]

    // 가이드 생성
    const createdGuides = []
    for (const guideData of guides) {
      const guide = await createGuide(guideData)
      createdGuides.push(guide)
    }

    // 각 가이드의 시간대 생성 (다음 7일간)
    const today = new Date()
    const timeSlots = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      
      for (const guide of createdGuides) {
        // 오전 시간대
        const morningSlot = await createTimeSlot({
          guideId: guide.id,
          date: dateString,
          startTime: '09:00',
          endTime: '12:00',
          isBooked: false
        })
        timeSlots.push(morningSlot)
        
        // 오후 시간대
        const afternoonSlot = await createTimeSlot({
          guideId: guide.id,
          date: dateString,
          startTime: '14:00',
          endTime: '17:00',
          isBooked: false
        })
        timeSlots.push(afternoonSlot)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: '초기 데이터가 성공적으로 생성되었습니다.',
      guides: createdGuides,
      timeSlots: timeSlots.length
    })

  } catch (error) {
    console.error('초기 데이터 생성 오류:', error)
    return NextResponse.json(
      { error: '초기 데이터 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 