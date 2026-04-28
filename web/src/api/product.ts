import api from '../utils/request'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  sold_count: number
  image: string
  status: number
  created_at: string
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  category_id?: number
  image?: string
}

export const productApi = {
  // 公开接口
  list: (page = 1, pageSize = 10) =>
    api.get('/products', { params: { page, page_size: pageSize } }),
  get: (id: number) => api.get(`/products/${id}`),

  // 商户接口
  merchantList: (page = 1, pageSize = 10) =>
    api.get('/products/merchant', { params: { page, page_size: pageSize } }),
  create: (data: CreateProductRequest) => api.post('/products/merchant', data),
  update: (id: number, data: CreateProductRequest) =>
    api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  updateStatus: (id: number, status: number) =>
    api.put(`/products/${id}/status`, { status }),
  importCards: (id: number, csvData: string) =>
    api.post(`/products/${id}/cards`, { csv_data: csvData }),
  uploadImage: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}