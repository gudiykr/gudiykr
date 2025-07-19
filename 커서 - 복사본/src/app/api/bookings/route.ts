import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tourId, tourTitle, guideId, guideName, travelerId, travelerName, date, startTime, endTime, participants, totalPrice, status } = body

    // 필수 필드 검증
    if (!tourId || !tourTitle || !guideId || !travelerId || !date || !startTime || !endTime || !participants || !totalPrice) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 예약 데이터 파일 경로
    const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json')
    
    // 기존 예약 데이터 로드
    let bookings = []
    if (fs.existsSync(bookingsFilePath)) {
      const bookingsData = fs.readFileSync(bookingsFilePath, 'utf-8')
      bookings = JSON.parse(bookingsData)
    }

    // 중복 예약 체크: 같은 고객이 같은 투어, 날짜, 시작시간에 이미 예약(pending/confirmed)이 있으면 불가
    const isDuplicate = bookings.some((b: any) =>
      String(b.travelerId) === String(travelerId) &&
      String(b.tourId) === String(tourId) &&
      b.date === date &&
      b.startTime === startTime &&
      (b.status === 'pending' || b.status === 'confirmed')
    )
    if (isDuplicate) {
      return NextResponse.json(
        { error: '이미 해당 투어에 같은 시간으로 예약이 존재합니다.' },
        { status: 409 }
      )
    }

    // 새 예약 생성
    const booking = {
      id: `booking-${Date.now()}`,
      tourId,
      tourTitle,
      guideId,
      guideName: guideName || '가이드',
      travelerId: String(travelerId), // ID를 문자열로 통일
      travelerName: travelerName || '고객',
      date,
      startTime,
      endTime,
      participants,
      totalPrice,
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 예약 데이터에 추가
    bookings.push(booking)
    
    // 파일에 저장
    fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2))

    return NextResponse.json({ 
      success: true, 
      booking,
      message: '예약이 완료되었습니다.' 
    })

  } catch (error) {
    console.error('예약 생성 오류:', error)
    return NextResponse.json(
      { error: '예약 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') as 'customer' | 'guide' | 'admin'

    console.log('예약 목록 조회 요청:', { userId, role })

    if (!userId || !role) {
      console.log('필수 파라미터 누락:', { userId, role })
      return NextResponse.json(
        { error: '사용자 ID와 역할이 필요합니다.' },
        { status: 400 }
      )
    }

    // 예약 데이터 파일 경로
    const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json')
    
    // 예약 데이터 로드
    let bookings = []
    if (fs.existsSync(bookingsFilePath)) {
      const bookingsData = fs.readFileSync(bookingsFilePath, 'utf-8')
      bookings = JSON.parse(bookingsData)
      console.log('전체 예약 개수:', bookings.length)
    } else {
      console.log('예약 데이터 파일이 존재하지 않음')
    }

    // 역할에 따라 예약 필터링
    let filteredBookings: any[] = []
    if (role === 'admin') {
      // 관리자: 모든 예약 조회
      filteredBookings = bookings
    } else {
      // 고객: 자신이 예약한 투어 중 취소되지 않은 예약만 조회
      filteredBookings = bookings.filter((booking: any) => String(booking.travelerId) === String(userId) && booking.status !== 'cancelled')
    }

    console.log('필터링된 예약 개수:', filteredBookings.length)

    return NextResponse.json({ 
      bookings: filteredBookings,
      message: '예약 목록을 성공적으로 조회했습니다.' 
    })

  } catch (error) {
    console.error('예약 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '예약 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 