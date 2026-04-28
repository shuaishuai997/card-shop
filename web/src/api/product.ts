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
    api.get('/merchant/products', { params: { page, page_size: pageSize } }),
  create: (data: CreateProductRequest) => api.post('/merchant/products', data),
  update: (id: number, data: CreateProductRequest) =>
    api.put(`/merchant/products/${id}`, data),
  delete: (id: number) => api.delete(`/merchant/products/${id}`),
  updateStatus: (id: number, status: number) =>
    api.put(`/merchant/products/${id}/status`, { status }),
  importCards: (id: number, csvData: string) =>
    api.post(`/merchant/products/${id}/cards`, { csv_data: csvData }),
}
