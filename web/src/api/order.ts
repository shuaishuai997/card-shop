import api from '../utils/request'

export interface Order {
  id: number
  order_no: string
  product_id: number
  quantity: number
  total_amount: number
  pay_amount: number
  pay_status: number
  pay_method: string
  pay_time: string
  buyer_email: string
  cards: string
  created_at: string
}

export interface CreateOrderRequest {
  product_id: number
  quantity: number
  buyer_email: string
  buyer_phone?: string
}

export const orderApi = {
  // 公开接口
  create: (data: CreateOrderRequest) => api.post('/orders', data),
  get: (orderNo: string) => api.get(`/orders/${orderNo}`),
  getPayUrl: (orderNo: string, type: 'alipay' | 'wxpay') =>
    api.get(`/orders/${orderNo}/pay`, { params: { type } }),
  queryByBuyer: (email: string, page = 1) =>
    api.get('/orders/query', { params: { email, page } }),

  // 商户接口
  merchantList: (page = 1, pageSize = 10, payStatus?: number) =>
    api.get('/merchant/orders', {
      params: { page, page_size: pageSize, pay_status: payStatus },
    }),
  merchantGet: (id: number) => api.get(`/merchant/orders/${id}`),
}
