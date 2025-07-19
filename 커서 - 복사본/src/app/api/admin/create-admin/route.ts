import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const adminData = {
      name: '관리자',
      email: 'admin@guidy.com',
      password: 'admin123',
      userType: 'admin',
      birthYear: 1990,
      gender: 'male'
    }

    const admin = await createUser(adminData)

    return NextResponse.json({ 
      message: '관리자 계정이 생성되었습니다',
      admin: {
        email: admin.email,
        password: 'admin123' // 실제 비밀번호는 해시화되어 저장됨
      }
    })

  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json({ error: '관리자 계정 생성 중 오류가 발생했습니다' }, { status: 500 })
  }
} 