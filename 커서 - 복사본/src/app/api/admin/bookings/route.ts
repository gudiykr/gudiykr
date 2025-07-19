import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // 예약 데이터 파일 경로
    const bookingsFilePath = path.join(process.cwd(), 'data', 'bookings.json')
    
    // 예약 데이터 로드
    let bookings = []
    if (fs.existsSync(bookingsFilePath)) {
      const bookingsData = fs.readFileSync(bookingsFilePath, 'utf-8')
      bookings = JSON.parse(bookingsData)
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('예약 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '예약 목록을 가져오는 중 오류가 발생했습니다' }, 
      { status: 500 }
    )
  }
} 