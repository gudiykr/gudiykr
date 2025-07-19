import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const bookingId = params.id

    // 예약 데이터 파일 경로
    const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json')
    
    // 기존 예약 데이터 로드
    let bookings = []
    if (fs.existsSync(bookingsFilePath)) {
      const bookingsData = fs.readFileSync(bookingsFilePath, 'utf-8')
      bookings = JSON.parse(bookingsData)
    }

    // 예약 찾기
    const bookingIndex = bookings.findIndex((booking: any) => booking.id === bookingId)
    
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 상태 업데이트
    bookings[bookingIndex].status = status
    bookings[bookingIndex].updatedAt = new Date().toISOString()
    
    // 파일에 저장
    fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2))

    return NextResponse.json({ 
      success: true,
      booking: bookings[bookingIndex],
      message: '예약 상태가 업데이트되었습니다.' 
    })

  } catch (error) {
    console.error('예약 상태 업데이트 오류:', error)
    return NextResponse.json(
      { error: '예약 상태 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 