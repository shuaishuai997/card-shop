import React, { useEffect, useState } from 'react'
import { Table, Tag, Space, Button, message } from 'antd'
import { orderApi, type Order } from '../api/order'

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res: any = await orderApi.merchantList()
      setOrders(res.data.list || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '商品ID', dataIndex: 'product_id', key: 'product_id' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '金额',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      render: (v: number) => `¥${v}`,
    },
    {
      title: '状态',
      dataIndex: 'pay_status',
      key: 'pay_status',
      render: (v: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'orange', text: '待支付' },
          1: { color: 'green', text: '已支付' },
          2: { color: 'red', text: '已退款' },
        }
        const s = statusMap[v] || { color: 'default', text: '未知' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: '支付方式', dataIndex: 'pay_method', key: 'pay_method' },
    { title: '买家邮箱', dataIndex: 'buyer_email', key: 'buyer_email' },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => new Date(v).toLocaleString(),
    },
  ]

  return (
    <div>
      <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} />
    </div>
  )
}
