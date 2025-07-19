import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TOURS_FILE = path.join(process.cwd(), 'data', 'tours.json')

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tourId = params.id
    const updatedTour = await request.json()

    // 기존 투어 데이터 읽기
    let tours = []
    if (fs.existsSync(TOURS_FILE)) {
      const data = fs.readFileSync(TOURS_FILE, 'utf8')
      tours = JSON.parse(data)
    }

    // 해당 투어 찾기
    const tourIndex = tours.findIndex((tour: any) => tour.id === Number(tourId))
    
    if (tourIndex === -1) {
      return NextResponse.json({ error: '투어를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 투어 업데이트
    tours[tourIndex] = updatedTour

    // 파일에 저장
    fs.writeFileSync(TOURS_FILE, JSON.stringify(tours, null, 2))

    return NextResponse.json({ 
      success: true, 
      message: '투어가 성공적으로 업데이트되었습니다.',
      tour: updatedTour
    })

  } catch (error) {
    console.error('투어 업데이트 오류:', error)
    return NextResponse.json(
      { error: '투어 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 