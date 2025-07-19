import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, userType, birthYear, gender } = await request.json()

    // 입력 검증
    if (!name || !email || !password || !userType || !birthYear || !gender) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 형식을 입력해주세요' }, { status: 400 })
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다' }, { status: 400 })
    }

    // 이메일 중복 확인
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다' }, { status: 400 })
    }

    // 사용자 생성
    const newUser = await createUser({ name, email, password, userType, birthYear, gender })

    return NextResponse.json({ 
      message: '회원가입이 완료되었습니다',
      userId: newUser.id 
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다' }, { status: 500 })
  }
} 