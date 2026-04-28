import api from '../utils/request'
import type { AxiosResponse } from 'axios'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string
  shop_name: string
  api_key: string
}

export const authApi = {
  login: (data: LoginRequest) => api.post('/login', data),
  register: (data: RegisterRequest) => api.post('/register', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data: Partial<User>) => api.put('/profile', data),
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.put('/password', data),
}