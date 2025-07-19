import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

export async function GET(request: NextRequest) {
  try {
    let users = []
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8')
      users = JSON.parse(data)
    }
    return NextResponse.json({ users })
  } catch (error) {
    console.error('회원 목록 조회 오류:', error)
    return NextResponse.json({ error: '회원 목록 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
} 