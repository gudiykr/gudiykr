import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TOURS_FILE = path.join(process.cwd(), 'data', 'tours.json')

// 초기 투어 데이터
const initialTours = [
  {
    id: 1,
    title: '한강에서 즐기는 피크닉 투어',
    description: '한강의 아름다운 풍경을 배경으로 즐기는 특별한 피크닉 투어입니다.',
    price: 30000,
    duration: '3시간',
    details: [
      '한강 공원에서 피크닉 준비',
      '한강의 역사와 문화 이야기',
      '사진 촬영 포인트 안내',
      '피크닉 음식 준비 및 정리',
      '한강 주변 명소 소개'
    ],
    image: '/images/hangang.jpg',
    guideId: 'guide-1',
    guideName: '김한강',
    guideDescription: '한강 전문 가이드로, 한강의 아름다움과 역사를 소개합니다.',
    guideRating: 4.8,
    guideSpecialties: ['한강', '자연', '사진촬영'],
    availableDates: [
      {
        date: '2025-01-15',
        timeSlots: [
          { startTime: '09:00', endTime: '12:00', maxParticipants: 5 },
          { startTime: '14:00', endTime: '17:00', maxParticipants: 5 }
        ]
      },
      {
        date: '2025-01-20',
        timeSlots: [
          { startTime: '09:00', endTime: '12:00', maxParticipants: 5 },
          { startTime: '14:00', endTime: '17:00', maxParticipants: 5 }
        ]
      },
      {
        date: '2025-01-25',
        timeSlots: [
          { startTime: '09:00', endTime: '12:00', maxParticipants: 5 },
          { startTime: '14:00', endTime: '17:00', maxParticipants: 5 }
        ]
      }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    // 파일에서 투어 데이터 로드
    let tours = initialTours
    if (fs.existsSync(TOURS_FILE)) {
      const data = fs.readFileSync(TOURS_FILE, 'utf8')
      tours = JSON.parse(data)
    } else {
      // 파일이 없으면 초기 데이터로 파일 생성
      fs.writeFileSync(TOURS_FILE, JSON.stringify(initialTours, null, 2))
    }

    // 예약 데이터 로드
    let bookings = []
    const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json')
    if (fs.existsSync(bookingsFilePath)) {
      const bookingsData = fs.readFileSync(bookingsFilePath, 'utf8')
      bookings = JSON.parse(bookingsData)
    }

    // 로그인한 사용자 id를 쿼리스트링에서 받음 (없으면 null)
    const url = new URL(request?.url || '', 'http://localhost')
    const userId = url.searchParams.get('userId')

    // 각 투어의 availableDates에서 이미 다른 고객이 예약한 날짜/시간은 제외
    tours = tours.map(tour => {
      const filteredDates = tour.availableDates?.map(dateObj => {
        const filteredTimeSlots = dateObj.timeSlots.filter(slot => {
          // 해당 날짜/시간에 예약(pending/confirmed)한 고객이 있으면, 본인 예약만 남기고 제외
          const isBookedByOther = bookings.some((b: any) =>
            String(b.tourId) === String(tour.id) &&
            b.date === dateObj.date &&
            b.startTime === slot.startTime &&
            (b.status === 'pending' || b.status === 'confirmed') &&
            (!userId || String(b.travelerId) !== String(userId))
          )
          return !isBookedByOther
        })
        return { ...dateObj, timeSlots: filteredTimeSlots }
      }).filter(dateObj => dateObj.timeSlots.length > 0)
      return { ...tour, availableDates: filteredDates }
    })

    return NextResponse.json({ 
      success: true, 
      tours,
      message: '투어 목록을 성공적으로 가져왔습니다.' 
    })
  } catch (error) {
    console.error('투어 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '투어 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, price, duration, images, guideName } = body
    if (!title || !description || !price || !duration || !guideName) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 })
    }

    // 파일에서 기존 투어 데이터 로드
    let tours = initialTours
    if (fs.existsSync(TOURS_FILE)) {
      const data = fs.readFileSync(TOURS_FILE, 'utf8')
      tours = JSON.parse(data)
    }

    // 새 투어 객체 생성 (id 자동 증가)
    const newId = tours.length > 0 ? Math.max(...tours.map((t: any) => t.id)) + 1 : 1
    const newTour = {
      id: newId,
      title,
      description,
      price,
      duration,
      details: body.details || [
        '투어 상세 정보를 추가해주세요'
      ],
      image: images && images.length > 0 ? images[0] : '/images/default.jpg',
      images: images || [],
      guideId: `guide-${newId}`,
      guideName,
      guideDescription: body.guideDescription || `${guideName} 가이드입니다.`,
      guideImage: body.guideImage || '',
      guideRating: 4.5,
      guideSpecialties: ['투어', '가이드'],
      maxParticipants: body.maxParticipants || 10,
      guideLanguage: body.guideLanguage || '한국어',
      availableDates: []
    }
    tours.push(newTour)
    fs.writeFileSync(TOURS_FILE, JSON.stringify(tours, null, 2))
    return NextResponse.json({ success: true, tour: newTour, message: '투어가 성공적으로 등록되었습니다.' })
  } catch (error) {
    console.error('투어 등록 오류:', error)
    return NextResponse.json({ error: '투어 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
} 

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 })
    }
    let tours = initialTours
    if (fs.existsSync(TOURS_FILE)) {
      const data = fs.readFileSync(TOURS_FILE, 'utf8')
      tours = JSON.parse(data)
    }
    const prevLen = tours.length
    tours = tours.filter((tour: any) => String(tour.id) !== String(id))
    if (tours.length === prevLen) {
      return NextResponse.json({ error: '해당 투어를 찾을 수 없습니다.' }, { status: 404 })
    }
    fs.writeFileSync(TOURS_FILE, JSON.stringify(tours, null, 2))
    return NextResponse.json({ success: true, message: '투어가 삭제되었습니다.' })
  } catch (error) {
    console.error('투어 삭제 오류:', error)
    return NextResponse.json({ error: '투어 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
} 