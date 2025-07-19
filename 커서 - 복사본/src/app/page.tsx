'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'

interface Tour {
  id: number
  title: string
  description: string
  price: number
  duration: string
  details: string[]
  image: string
  guideId: string
  guideName: string
  guideDescription: string
  guideRating: number
  guideSpecialties: string[]
  images?: string[] // 이미지 배열 추가
  maxParticipants?: number // 최대 인원수 추가
}

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    loadTours()
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.userType === 'admin' || user.email === 'admin@guidy.com') {
          setAdmin(true)
        }
      } catch {}
    }
  }, [])

  const loadTours = async () => {
    try {
      const response = await fetch('/api/tours')
      const data = await response.json()
      
      if (response.ok) {
        // API 응답 구조에 따라 tours 배열을 가져옴
        setTours(data.tours || data)
      } else {
        console.error('API 응답 오류:', data)
      }
    } catch (error) {
      console.error('투어 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">투어 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Guidy 소개 배너 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Guidy와 함께하는 특별한 여행
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              현지 가이드와 함께하는 맞춤형 투어로 잊을 수 없는 경험을 만들어보세요
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">현지 가이드</h3>
                <p className="text-blue-100">경험 많은 현지 가이드들이 안내해드립니다</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">편리한 예약</h3>
                <p className="text-blue-100">간단한 클릭으로 원하는 투어를 예약하세요</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">특별한 경험</h3>
                <p className="text-blue-100">일반 관광이 아닌 특별한 현지 경험을 제공합니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          {admin && (
            <Link href="/admin">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                관리자 페이지
              </button>
            </Link>
          )}
        </div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">투어 예약</h2>
          <p className="text-gray-600">원하는 투어를 선택하고 예약하세요.</p>
        </div>

        {/* 투어 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map(tour => (
            <div key={tour.id} className="bg-white rounded-lg shadow-md flex flex-col h-full hover:shadow-lg transition-shadow">
              {/* 메인 이미지 */}
              <div className="w-full aspect-[3/4] bg-gray-200 relative">
                {tour.images && tour.images.length > 0 ? (
                  <img 
                    src={tour.images[0]} 
                    alt={tour.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = 'none';
                      const fallback = img.parentElement?.querySelector('.image-fallback');
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 image-fallback">
                    <span className="text-gray-500">이미지 준비중</span>
                  </div>
                )}
              </div>
              {/* 썸네일 리스트 */}
              {tour.images && tour.images.length > 1 && (
                <div className="flex gap-1 p-2 overflow-x-auto bg-white">
                  {tour.images.slice(1, 5).map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${tour.title} ${idx + 2}`}
                      className="w-8 h-8 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="flex-1 flex flex-col p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{tour.title}</h3>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-xs text-gray-500">소요시간</span>
                    <p className="font-medium text-sm">{tour.duration}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">가격</span>
                    <p className="font-bold text-blue-600 text-base">₩{tour.price.toLocaleString()}</p>
                    <span className="block text-xs text-gray-500 mt-1">최대 {tour.maxParticipants || 10}명</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => window.location.href = `/tour/${tour.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 