'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminGuard from '@/components/AdminGuard'

interface User {
  id: number
  name: string
  email: string
  userType: string
  birthYear: number
  gender: string
  createdAt: string
}

interface Booking {
  id: string
  userId: string
  tourTitle: string
  selectedDate: string
  participants: number
  totalPrice: number
  status: string
  createdAt: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'bookings'>('users')
  const [loading, setLoading] = useState(true)
  const [showTourModal, setShowTourModal] = useState(false)
  const [newTour, setNewTour] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    images: [] as string[],
    guideName: '',
    guideDescription: '',
    guideImage: '',
    details: [''] as string[],
    maxParticipants: 10,
    guideLanguage: '한국어',
  })
  const [newTourFiles, setNewTourFiles] = useState<File[]>([])
  const [tours, setTours] = useState<any[]>([])
  const [editTour, setEditTour] = useState<any | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTourFiles, setEditTourFiles] = useState<File[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 사용자 데이터 가져오기
      const usersResponse = await fetch('/api/admin/users')
      const usersData = await usersResponse.json()
      setUsers(usersData.users || [])

      // 예약 데이터 가져오기
      const bookingsResponse = await fetch('/api/admin/bookings')
      const bookingsData = await bookingsResponse.json()
      setBookings(bookingsData.bookings || [])

      // 투어 데이터 가져오기
      const toursResponse = await fetch('/api/tours')
      const toursData = await toursResponse.json()
      setTours(toursData.tours || [])
    } catch (error) {
      console.error('데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // 성공 메시지 표시
        const statusText = {
          'pending': '대기중',
          'confirmed': '확정',
          'cancelled': '취소'
        }[newStatus] || newStatus
        
        alert(`예약 상태가 "${statusText}"으로 변경되었습니다.`)
        fetchData() // 데이터 새로고침
      } else {
        const data = await response.json()
        alert(data.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('상태 변경 오류:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  // 투어 등록 핸들러
  const handleTourInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewTour({ ...newTour, [e.target.name]: e.target.value })
  }

  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...newTour.details]
    newDetails[index] = value
    setNewTour({ ...newTour, details: newDetails })
  }

  const addDetail = () => {
    setNewTour({ ...newTour, details: [...newTour.details, ''] })
  }

  const removeDetail = (index: number) => {
    const newDetails = newTour.details.filter((_, i) => i !== index)
    setNewTour({ ...newTour, details: newDetails })
  }

  const handleTourFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 10)
      setNewTourFiles(files)
    }
  }

  const handleTourSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.name === 'maxParticipants' ? Number(e.target.value) : e.target.value
    setNewTour({ ...newTour, [e.target.name]: value })
  }

  const handleAddTour = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTour.title || !newTour.description || !newTour.price || !newTour.duration || !newTour.guideName) {
      alert('모든 항목을 입력해주세요.')
      return
    }
    let imageUrls: string[] = []
    if (newTourFiles.length > 0) {
      const formData = new FormData()
      newTourFiles.forEach(f => formData.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) imageUrls = data.urls
      else {
        alert('이미지 업로드 실패')
        return
      }
    }
    try {
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTour,
          price: Number(newTour.price),
          images: imageUrls,
        })
      })
      if (response.ok) {
        alert('투어가 등록되었습니다!')
        setShowTourModal(false)
        setNewTour({ title: '', description: '', price: '', duration: '', images: [] as string[], guideName: '', guideDescription: '', guideImage: '', details: [''], maxParticipants: 10, guideLanguage: '한국어' })
        setNewTourFiles([])
        fetchData()
      } else {
        alert('투어 등록에 실패했습니다.')
      }
    } catch (error) {
      alert('투어 등록 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteTour = async (id: number) => {
    if (!confirm('정말로 이 투어를 삭제하시겠습니까?')) return
    try {
      const response = await fetch(`/api/tours?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        alert('투어가 삭제되었습니다.')
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleEditTour = (tour: any) => {
    setEditTour({ ...tour })
    setShowEditModal(true)
  }

  const handleEditInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditTour({ ...editTour, [e.target.name]: e.target.value })
  }

  const handleEditDetailChange = (index: number, value: string) => {
    const newDetails = [...(editTour?.details || [])]
    newDetails[index] = value
    setEditTour({ ...editTour, details: newDetails })
  }

  const addEditDetail = () => {
    setEditTour({ ...editTour, details: [...(editTour?.details || []), ''] })
  }

  const removeEditDetail = (index: number) => {
    const newDetails = (editTour?.details || []).filter((_, i) => i !== index)
    setEditTour({ ...editTour, details: newDetails })
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 10)
      setEditTourFiles(files)
    }
  }

  // 투어 수정 모달 내 기존 이미지 삭제
  const handleRemoveEditImage = (idx: number) => {
    if (!editTour) return;
    const newImages = (editTour.images || []).filter((_: string, i: number) => i !== idx)
    setEditTour({ ...editTour, images: newImages })
  }

  const handleEditTourSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.name === 'maxParticipants' ? Number(e.target.value) : e.target.value
    setEditTour({ ...editTour, [e.target.name]: value })
  }

  const handleUpdateTour = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTour.title || !editTour.description || !editTour.price || !editTour.duration || !editTour.guideName) {
      alert('모든 항목을 입력해주세요.')
      return
    }
    let imageUrls = editTour.images || []
    if (editTourFiles.length > 0) {
      const formData = new FormData()
      editTourFiles.forEach(f => formData.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) imageUrls = [...imageUrls, ...data.urls]
      else {
        alert('이미지 업로드 실패')
        return
      }
    }
    try {
      const response = await fetch(`/api/tours/${editTour.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editTour,
          price: Number(editTour.price),
          images: imageUrls,
        })
      })
      if (response.ok) {
        alert('투어가 수정되었습니다!')
        setShowEditModal(false)
        setEditTour(null)
        setEditTourFiles([])
        fetchData()
      } else {
        alert('수정에 실패했습니다.')
      }
    } catch (error) {
      alert('수정 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Guidy
            </Link>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900">
                홈
              </Link>
              <span className="text-blue-600 font-medium">관리자</span>
              <button
                className="ml-6 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={() => setShowTourModal(true)}
              >
                투어 등록
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 투어 등록 모달 */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col relative">
            <h2 className="text-2xl font-bold mb-6">투어 등록</h2>
            <form onSubmit={handleAddTour} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* 투어 제목 */}
              <div>
                <label className="block text-sm font-medium mb-1">투어명</label>
                <input name="title" value={newTour.title} onChange={handleTourInput} className="w-full border px-3 py-2 rounded" />
              </div>
              
              {/* 투어 설명 */}
              <div>
                <label className="block text-sm font-medium mb-1">투어 설명</label>
                <textarea name="description" value={newTour.description} onChange={handleTourInput} className="w-full border px-3 py-2 rounded" />
              </div>
              
              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium mb-1">이미지 업로드 (최대 10장)</label>
                <input type="file" accept="image/*" multiple onChange={handleTourFileChange} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {newTourFiles.map((file: any, idx: number) => (
                    <img key={idx} src={URL.createObjectURL(file)} alt="미리보기" className="w-20 h-20 object-cover rounded border" />
                  ))}
                </div>
              </div>
              
              {/* 가이드 정보 */}
              <div>
                <label className="block text-sm font-medium mb-1">가이드명</label>
                <input name="guideName" value={newTour.guideName} onChange={handleTourInput} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">가이드 소개</label>
                <textarea 
                  name="guideDescription" 
                  value={newTour.guideDescription} 
                  onChange={handleTourInput} 
                  placeholder="가이드에 대한 소개를 작성해주세요"
                  className="w-full border px-3 py-2 rounded h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">가이드 이미지</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setNewTour({ ...newTour, guideImage: e.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border px-3 py-2 rounded"
                />
                {newTour.guideImage && (
                  <div className="mt-2">
                    <img 
                      src={newTour.guideImage} 
                      alt="가이드 이미지 미리보기" 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              
              {/* 투어 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">가격(원)</label>
                  <input name="price" type="number" value={newTour.price} onChange={handleTourInput} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">소요시간</label>
                  <input name="duration" value={newTour.duration} onChange={handleTourInput} className="w-full border px-3 py-2 rounded" />
                </div>
              </div>
              
              {/* 인원수 및 가이드 언어 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">최대 인원수</label>
                  <select 
                    name="maxParticipants" 
                    value={newTour.maxParticipants} 
                    onChange={handleTourSelectChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((num: number, i: number) => (
                      <option key={num} value={num}>{num}명</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">가이드 언어</label>
                  <select 
                    name="guideLanguage" 
                    value={newTour.guideLanguage} 
                    onChange={handleTourSelectChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="한국어">한국어</option>
                    <option value="일본어">일본어</option>
                    <option value="영어">영어</option>
                  </select>
                </div>
              </div>
              
              {/* 투어 상세 정보 */}
              <div>
                <label className="block text-sm font-medium mb-1">투어 상세 정보</label>
                <div className="space-y-2">
                  {newTour.details.map((detail: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={detail}
                        onChange={(e) => handleDetailChange(index, e.target.value)}
                        placeholder="상세 정보를 입력하세요"
                        className="flex-1 border px-3 py-2 rounded"
                      />
                      {newTour.details.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDetail}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-gray-400 hover:text-gray-600"
                  >
                    + 상세 정보 추가
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowTourModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">취소</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">등록</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 투어 수정 모달 */}
      {showEditModal && editTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">투어 수정</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleUpdateTour} className="space-y-4">
              {/* 투어 제목 */}
              <div>
                <label className="block text-sm font-medium mb-1">투어명</label>
                <input name="title" value={editTour.title} onChange={handleEditInput} className="w-full border px-3 py-2 rounded" />
              </div>
              
              {/* 투어 설명 */}
              <div>
                <label className="block text-sm font-medium mb-1">투어 설명</label>
                <textarea name="description" value={editTour.description} onChange={handleEditInput} className="w-full border px-3 py-2 rounded" />
              </div>
              
              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium mb-1">이미지 업로드 (최대 10장)</label>
                <input type="file" accept="image/*" multiple onChange={handleEditFileChange} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editTourFiles.length > 0
                    ? editTourFiles.map((file, idx) => (
                        <img key={idx} src={URL.createObjectURL(file)} alt="미리보기" className="w-20 h-20 object-cover rounded border" />
                      ))
                    : (editTour.images || []).map((url: string, idx: number) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt="미리보기" className="w-20 h-20 object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => handleRemoveEditImage(idx)}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                            title="삭제"
                          >
                            ×
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
              
              {/* 가이드 정보 */}
              <div>
                <label className="block text-sm font-medium mb-1">가이드명</label>
                <input name="guideName" value={editTour.guideName} onChange={handleEditInput} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">가이드 소개</label>
                <textarea 
                  name="guideDescription" 
                  value={editTour.guideDescription || ''} 
                  onChange={handleEditInput} 
                  placeholder="가이드에 대한 소개를 작성해주세요"
                  className="w-full border px-3 py-2 rounded h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">가이드 이미지</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setEditTour({ ...editTour, guideImage: e.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border px-3 py-2 rounded"
                />
                {(editTour.guideImage || editTour.guideImage) && (
                  <div className="mt-2">
                    <img 
                      src={editTour.guideImage || editTour.guideImage} 
                      alt="가이드 이미지 미리보기" 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              
              {/* 투어 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">가격(원)</label>
                  <input name="price" type="number" value={editTour.price} onChange={handleEditInput} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">소요시간</label>
                  <input name="duration" value={editTour.duration} onChange={handleEditInput} className="w-full border px-3 py-2 rounded" />
                </div>
              </div>
              
              {/* 인원수 및 가이드 언어 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">최대 인원수</label>
                  <select 
                    name="maxParticipants" 
                    value={editTour.maxParticipants || 10} 
                    onChange={handleEditTourSelectChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((num: number, _i: any) => (
                      <option key={num} value={num}>{num}명</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">가이드 언어</label>
                  <select 
                    name="guideLanguage" 
                    value={editTour.guideLanguage || '한국어'} 
                    onChange={handleEditTourSelectChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="한국어">한국어</option>
                    <option value="일본어">일본어</option>
                    <option value="영어">영어</option>
                  </select>
                </div>
              </div>
              
              {/* 투어 상세 정보 */}
              <div>
                <label className="block text-sm font-medium mb-1">투어 상세 정보</label>
                <textarea
                  value={editTour.details ? editTour.details.join('\n') : ''}
                  onChange={e => setEditTour({ ...editTour, details: e.target.value.split(/\r?\n/) })}
                  placeholder="여러 줄로 입력하면 상세페이지에서 줄바꿈이 반영됩니다."
                  className="w-full border px-3 py-2 rounded h-32"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">취소</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">저장</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 대시보드</h1>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              회원 관리 ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              예약 관리 ({bookings.length})
            </button>
          </nav>
        </div>

        {/* 회원 관리 탭 */}
        {activeTab === 'users' && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">회원 목록</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회원ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      나이
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      성별
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.userType === 'guide' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.userType === 'guide' ? '가이드' : '여행자'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.birthYear}년생
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.gender === 'male' ? '남성' : '여성'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 예약 관리 탭 */}
        {activeTab === 'bookings' && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">예약 목록</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      투어
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      인원
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      총 금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예약일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.tourTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.selectedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.participants}명
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₩{booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className={`text-sm border rounded px-2 py-1 ${
                            booking.status === 'confirmed' 
                              ? 'border-green-300 bg-green-50 text-green-800' 
                              : booking.status === 'cancelled'
                              ? 'border-red-300 bg-red-50 text-red-800'
                              : 'border-yellow-300 bg-yellow-50 text-yellow-800'
                          }`}
                        >
                          <option value="pending">대기중</option>
                          <option value="confirmed">확정</option>
                          <option value="cancelled">취소</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 투어 관리 탭 */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">투어 목록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">투어명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가이드명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tours.map((tour) => (
                  <tr key={tour.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.guideName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₩{tour.price.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditTour(tour)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm mr-2"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </AdminGuard>
  )
} 