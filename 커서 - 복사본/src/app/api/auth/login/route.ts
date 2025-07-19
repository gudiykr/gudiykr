import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요' }, { status: 400 })
    }

    // 사용자 조회
    const user = await findUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' }, { status: 401 })
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' }, { status: 401 })
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.userType 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({ 
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '로그인 중 오류가 발생했습니다' }, { status: 500 })
  }
} 