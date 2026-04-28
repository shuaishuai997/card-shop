import React, { useState } from 'react'
import { Card, Input, Button, Table, Tag, message, Empty } from 'antd'
import { SearchOutlined, MailOutlined, EyeOutlined, HomeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { orderApi } from '../api/order'
import type { Order } from '../api/order'

export const OrderQuery: React.FC = () => {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleSearch = async () => {
    if (!email) {
      message.warning('请输入邮箱地址')
      return
    }
    try {
      setLoading(true)
      const res: any = await orderApi.queryByBuyer(email, 1)
      setOrders(res.data?.list || res.data || [])
      setSearched(true)
    } catch {
      message.error('查询失败')
    } finally {
      setLoading(false)
    }
  }

  const showOrderDetail = async (orderNo: string) => {
    try {
      const res: any = await orderApi.get(orderNo)
      setSelectedOrder(res.data)
    } catch {
      message.error('获取订单详情失败')
    }
  }

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0: return <Tag style={styles.tagOrange}>待支付</Tag>
      case 1: return <Tag style={styles.tagBlue}>支付中</Tag>
      case 2: return <Tag style={styles.tagGreen}>已完成</Tag>
      default: return <Tag style={styles.tagRed}>异常</Tag>
    }
  }

  const columns = [
    {
      title: 'ORDER_NO',
      dataIndex: 'order_no',
      key: 'order_no',
      render: (text: string) => <code style={styles.orderNo}>{text}</code>,
    },
    {
      title: 'AMOUNT',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      render: (amount: number) => <span style={styles.amount}>¥{amount?.toFixed(2)}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'pay_status',
      key: 'pay_status',
      render: (status: number) => getStatusTag(status),
    },
    {
      title: 'TIME',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => <span style={styles.time}>{time?.split('T')[0] || '-'}</span>,
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_: any, record: Order) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => showOrderDetail(record.order_no)}
          style={styles.viewBtn}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.gridBg} />

      {/* 顶部导航 */}
      <div style={styles.navbar}>
        <div style={styles.navScan} />
        <div style={styles.navInner}>
          <a href="/" style={styles.logo}>
            <span style={styles.logoIcon}>⬡</span>
            <span style={styles.logoText}>CYBER CARD</span>
          </a>
          <Link to="/" style={styles.backBtn}>
            <HomeOutlined /> 返回首页
          </Link>
        </div>
        <div style={styles.navScan} />
      </div>

      <div style={styles.content}>
        {/* 标题 */}
        <div style={styles.titleBlock}>
          <div style={styles.titleSlash}>// </div>
          <h1 style={styles.title}>ORDER QUERY</h1>
        </div>

        {/* 搜索框 */}
        <div style={styles.searchCard}>
          <div style={styles.searchLabel}>// ENTER YOUR EMAIL TO QUERY ORDERS</div>
          <div style={styles.searchRow}>
            <Input
              size="large"
              placeholder="your@email.com"
              prefix={<MailOutlined style={{ color: '#00f0ff' }} />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onPressEnter={handleSearch}
              style={styles.emailInput}
            />
            <Button
              size="large"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
              style={styles.searchBtn}
            >
              查询
            </Button>
          </div>
        </div>

        {/* 订单列表 */}
        {searched && (
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <span style={styles.resultTitle}>// ORDER LIST</span>
              <span style={styles.resultCount}>[{orders.length}]</span>
            </div>

            {orders.length === 0 ? (
              <div style={{ padding: 40 }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span style={{ color: '#4a4a6a' }}>// NO ORDERS FOUND</span>}
                />
              </div>
            ) : (
              <Table
                dataSource={orders}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                style={styles.table}
              />
            )}
          </div>
        )}

        {/* 订单详情 */}
        {selectedOrder && (
          <div style={styles.detailCard}>
            <div style={styles.detailHeader}>
              <span style={styles.detailTitle}>// ORDER DETAIL</span>
              <button style={styles.closeBtn} onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div style={styles.detailGrid}>
              {[
                { label: 'ORDER_NO', value: selectedOrder.order_no },
                { label: 'STATUS', value: getStatusTag(selectedOrder.pay_status) },
                { label: 'AMOUNT', value: <span style={styles.amount}>¥{selectedOrder.pay_amount?.toFixed(2)}</span> },
                { label: 'METHOD', value: selectedOrder.pay_method === 'alipay' ? '支付宝' : '微信' },
                { label: 'TIME', value: <span style={styles.time}>{selectedOrder.created_at}</span> },
                { label: 'QUANTITY', value: selectedOrder.quantity },
              ].map((item, i) => (
                <div key={i} style={styles.detailRow}>
                  <span style={styles.detailLabel}>{item.label}</span>
                  <span style={styles.detailValue}>{item.value}</span>
                </div>
              ))}
            </div>

            {selectedOrder.pay_status === 2 && selectedOrder.cards && (
              <div style={styles.cardsBlock}>
                <div style={styles.cardsLabel}>// CARD KEYS</div>
                <div style={styles.cardsList}>
                  {selectedOrder.cards.split('\n').map((card, index) => (
                    <div key={index} style={styles.cardItem}>
                      <code style={styles.cardCode}>{card}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .ant-table { background: transparent !important; }
        .ant-table-thead > tr > th {
          background: rgba(0,240,255,0.06) !important;
          border-bottom: 1px solid #1a1a3a !important;
          color: #00f0ff !important;
          font-family: 'Courier New', monospace !important;
          font-size: 11px !important;
          letter-spacing: 1px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #0d0d1a !important;
          color: #e0e0ff !important;
          font-family: 'Courier New', monospace !important;
          font-size: 12px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: rgba(0,240,255,0.04) !important;
        }
        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#050510',
    fontFamily: "'Courier New', 'PingFang SC', monospace",
    color: '#e0e0ff',
    position: 'relative',
  },
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,240,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  navbar: {
    background: '#0a0a1a',
    borderBottom: '1px solid #1a1a3a',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navScan: {
    height: 2,
    background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
    animation: 'pulse 3s infinite',
  },
  navInner: {
    maxWidth: 800,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: 56,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: 22,
    color: '#00f0ff',
    textShadow: '0 0 10px #00f0ff',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#00f0ff',
    letterSpacing: 3,
  },
  backBtn: {
    color: '#6a6a9a',
    textDecoration: 'none',
    fontSize: 13,
    letterSpacing: 1,
    transition: 'color 0.2s',
    fontFamily: "'PingFang SC', 'Courier New', monospace",
  },
  content: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '40px 32px 60px',
    position: 'relative',
    zIndex: 1,
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 32,
  },
  titleSlash: {
    color: '#ff00aa',
    fontSize: 28,
    fontWeight: 900,
    textShadow: '0 0 10px #ff00aa',
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    color: '#e0e0ff',
    letterSpacing: 4,
    margin: 0,
  },
  searchCard: {
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  searchLabel: {
    color: '#6a6a9a',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 16,
  },
  searchRow: {
    display: 'flex',
    gap: 12,
  },
  emailInput: {
    flex: 1,
    background: '#050510',
    border: '1px solid #1a1a3a',
    color: '#e0e0ff',
    borderRadius: 4,
    height: 44,
    fontFamily: "'Courier New', monospace",
  },
  searchBtn: {
    background: 'rgba(0,240,255,0.1)',
    border: '1px solid rgba(0,240,255,0.4)',
    color: '#00f0ff',
    borderRadius: 4,
    height: 44,
    padding: '0 24px',
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
  resultCard: {
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid #1a1a3a',
  },
  resultTitle: {
    color: '#00f0ff',
    fontSize: 12,
    letterSpacing: 2,
    textShadow: '0 0 6px rgba(0,240,255,0.5)',
  },
  resultCount: {
    color: '#ff00aa',
    fontSize: 12,
  },
  table: {
    borderRadius: 0,
  },
  orderNo: {
    color: '#6a6a9a',
    fontSize: 11,
    letterSpacing: 1,
    background: 'rgba(0,240,255,0.05)',
    padding: '2px 6px',
    borderRadius: 3,
    border: '1px solid rgba(0,240,255,0.15)',
  },
  amount: {
    color: '#ff00aa',
    fontWeight: 700,
    textShadow: '0 0 6px rgba(255,0,170,0.5)',
  },
  time: {
    color: '#6a6a9a',
    fontSize: 11,
    letterSpacing: 1,
  },
  viewBtn: {
    color: '#00f0ff',
    fontSize: 11,
    letterSpacing: 1,
    padding: '0 4px',
  },
  tagGreen: {
    background: 'rgba(0,240,255,0.1)',
    border: '1px solid rgba(0,240,255,0.4)',
    color: '#00f0ff',
    fontSize: 10,
    letterSpacing: 1,
  },
  tagRed: {
    background: 'rgba(255,51,102,0.1)',
    border: '1px solid rgba(255,51,102,0.4)',
    color: '#ff3366',
    fontSize: 10,
    letterSpacing: 1,
  },
  tagOrange: {
    background: 'rgba(255,136,0,0.1)',
    border: '1px solid rgba(255,136,0,0.4)',
    color: '#ff8800',
    fontSize: 10,
    letterSpacing: 1,
  },
  tagBlue: {
    background: 'rgba(0,136,255,0.1)',
    border: '1px solid rgba(0,136,255,0.4)',
    color: '#0088ff',
    fontSize: 10,
    letterSpacing: 1,
  },
  detailCard: {
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #1a1a3a',
  },
  detailTitle: {
    color: '#00f0ff',
    fontSize: 12,
    letterSpacing: 2,
    textShadow: '0 0 6px rgba(0,240,255,0.5)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#4a4a6a',
    fontSize: 20,
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 4px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 0,
    padding: 8,
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    padding: '12px 16px',
    borderBottom: '1px solid #0d0d1a',
  },
  detailLabel: {
    color: '#4a4a6a',
    fontSize: 10,
    letterSpacing: 2,
  },
  detailValue: {
    color: '#e0e0ff',
    fontSize: 13,
    letterSpacing: 1,
  },
  cardsBlock: {
    padding: 20,
    borderTop: '1px solid #1a1a3a',
  },
  cardsLabel: {
    color: '#00f0ff',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
    textShadow: '0 0 6px rgba(0,240,255,0.5)',
  },
  cardsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  cardItem: {
    padding: '10px 14px',
    background: '#050510',
    border: '1px solid #1a1a3a',
    borderRadius: 4,
  },
  cardCode: {
    fontFamily: "'Courier New', monospace",
    fontSize: 14,
    color: '#00f0ff',
    letterSpacing: 1,
  },
}
