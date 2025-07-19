import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

// 데이터 파일 경로
const dataDir = path.join(process.cwd(), 'data')
const usersFile = path.join(dataDir, 'users.json')
const bookingsFile = path.join(dataDir, 'bookings.json')
const toursFile = path.join(dataDir, 'tours.json')

// 데이터 디렉토리 생성
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 파일에서 데이터 읽기
function readJsonFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

// 파일에 데이터 쓰기
function writeJsonFile(filePath: string, data: any) {
  ensureDataDir()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// 사용자 관련 함수들
export async function createUser(userData: any) {
  const users = readJsonFile(usersFile)
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  
  const newUser = {
    id: users.length + 1,
    ...userData,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  users.push(newUser)
  writeJsonFile(usersFile, users)
  
  return { ...newUser, password: undefined }
}

export async function findUserByEmail(email: string) {
  const users = readJsonFile(usersFile)
  return users.find((user: any) => user.email === email)
}

export async function getAllUsers() {
  return readJsonFile(usersFile).map((user: any) => ({
    ...user,
    password: undefined
  }))
}

// 예약 관련 함수들
export async function createBooking(bookingData: any) {
  const bookings = readJsonFile(bookingsFile)
  
  const newBooking = {
    id: bookings.length + 1,
    ...bookingData,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  bookings.push(newBooking)
  writeJsonFile(bookingsFile, bookings)
  
  return newBooking
}

export async function getAllBookings() {
  return readJsonFile(bookingsFile)
}

export async function updateBookingStatus(bookingId: number, status: string) {
  const bookings = readJsonFile(bookingsFile)
  const bookingIndex = bookings.findIndex((booking: any) => booking.id === bookingId)
  
  if (bookingIndex !== -1) {
    bookings[bookingIndex].status = status
    writeJsonFile(bookingsFile, bookings)
    return bookings[bookingIndex]
  }
  
  return null
}

// 투어 관련 함수들
export async function getAllTours() {
  const tours = readJsonFile(toursFile)
  
  if (tours.length === 0) {
    // 기본 투어 데이터 생성 (가이드 ID 포함)
    const defaultTours = [
      {
        id: 1,
        title: '한강나들이',
        description: '아름다운 한강을 따라 현지인과 함께하는 특별한 나들이',
        price: 30000,
        duration: '3시간',
        image: '/images/hangang.jpg',
        guideId: 'guide-1', // 가이드 ID 추가
        details: [
          '한강공원에서 시작하여 여의도까지',
          '현지인 가이드와 함께하는 문화 체험',
          '사진 촬영 및 추억 만들기',
          '간단한 다과 제공'
        ]
      },
      {
        id: 2,
        title: '야구장 나들이',
        description: '한국의 야구 문화를 체험하는 현지인 가이드 투어',
        price: 30000,
        duration: '4시간',
        image: '/images/baseball.jpg',
        guideId: 'guide-2', // 가이드 ID 추가
        details: [
          '야구장 관람 및 문화 체험',
          '현지인 가이드와 함께하는 특별한 경험',
          '야구 용품 체험',
          '간단한 다과 제공'
        ]
      },
      {
        id: 3,
        title: '익선동 맛집 투어',
        description: '익선동의 숨겨진 맛집들을 현지인과 함께 탐방',
        price: 30000,
        duration: '3시간',
        image: '/images/ikseon.jpg',
        guideId: 'guide-3', // 가이드 ID 추가
        details: [
          '익선동 전통시장 탐방',
          '숨겨진 맛집 발굴',
          '전통 한식 체험',
          '현지인 가이드와 함께하는 특별한 경험'
        ]
      }
    ]
    
    writeJsonFile(toursFile, defaultTours)
    return defaultTours
  }
  
  return tours
}

export async function getTourById(id: number) {
  const tours = await getAllTours()
  return tours.find((tour: any) => tour.id === id)
}

// 데이터베이스 초기화
export async function initializeDatabase() {
  ensureDataDir()
  await getAllTours() // 기본 투어 데이터 생성
  console.log('Database initialized successfully')
} 