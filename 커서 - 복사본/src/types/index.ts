export interface User {
  id: string
  email: string
  name: string
  role: 'guide' | 'traveler'
  createdAt: Date
  updatedAt: Date
}

export interface Guide {
  id: string
  userId: string
  name: string
  description: string
  specialties: string[]
  rating: number
  totalBookings: number
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TimeSlot {
  id: string
  guideId: string
  date: string // YYYY-MM-DD 형식
  startTime: string // HH:MM 형식
  endTime: string // HH:MM 형식
  isBooked: boolean
  bookingId?: string
  createdAt: Date
}

export interface Booking {
  id: string
  guideId: string
  travelerId: string
  timeSlotId: string
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalPrice: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'booking' | 'reminder' | 'cancellation'
  isRead: boolean
  createdAt: Date
} 