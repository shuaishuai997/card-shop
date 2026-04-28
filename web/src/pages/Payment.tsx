import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Spin, Button, message, QRCode, Space } from 'antd'
import { CheckCircleOutlined, CopyOutlined } from '@ant-design/icons'
import { orderApi } from '../api/order'

export const Payment: React.FC = () => {
  const { orderNo } = useParams<{ orderNo: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payUrl, setPayUrl] = useState('')
  const [payMethod, setPayMethod] = useState<'alipay' | 'wxpay'>('alipay')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (orderNo) loadOrder(orderNo)
  }, [orderNo])

  const loadOrder = async (no: string) => {
    try {
      const res: any = await orderApi.get(no)
      setOrder(res.data)
      if (res.data?.pay_status === 2) {
        setLoading(false)
        return
      }
      await fetchPayUrl(no, payMethod)
    } catch {
      message.error('订单不存在')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchPayUrl = async (no: string, type: 'alipay' | 'wxpay') => {
    try {
      const res: any = await orderApi.getPayUrl(no, type)
      setPayUrl(res.data?.pay_url || '')
    } catch {
      // ignore
    }
  }

  const handleChangePayMethod = (type: 'alipay' | 'wxpay') => {
    setPayMethod(type)
    if (orderNo) fetchPayUrl(orderNo, type)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNo || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    message.success('订单号已复制')
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.gridBg} />
        <div style={styles.loadingBox}>
          <Spin size="large" />
          <p style={{ color: '#00f0ff', marginTop: 20, fontFamily: 'monospace', letterSpacing: 2 }}>
            LOADING...
          </p>
        </div>
      </div>
    )
  }

  // 已支付
  if (order?.pay_status === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.gridBg} />
        <div style={styles.centerBox}>
          <div style={styles.cornerTL} />
          <div style={styles.cornerTR} />
          <div style={styles.cornerBL} />
          <div style={styles.cornerBR} />

          <div style={styles.successBadge}>// PAYMENT CONFIRMED</div>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.successTitle}>支付成功</h1>
          <p style={styles.successOrder}>ORDER: {order.order_no}</p>

          <div style={styles.cardsSection}>
            <div style={styles.sectionLabel}>// YOUR CARD KEYS</div>
            <div style={styles.cardsList}>
              {order.cards?.split('\n').map((card: string, index: number) => (
                <div key={index} style={styles.cardItem}>
                  <code style={styles.cardCode}>{card}</code>
                </div>
              )) || (
                <div style={styles.cardItem}>
                  <span style={{ color: '#ff8800', letterSpacing: 2 }}>// NO CARD DATA - CONTACT SUPPORT</span>
                </div>
              )}
            </div>
          </div>

          <div style={styles.tips}>
            <span>📧 已发送至: {order.buyer_email}</span>
            <span>⚠️ 请妥善保管，遗失不补</span>
          </div>

          <Link to="/">
            <Button style={styles.continueBtn} icon={<span>→</span>}>
              返回商城
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // 未支付
  return (
    <div style={styles.container}>
      <div style={styles.gridBg} />
      <div style={styles.centerBox}>
        <div style={styles.cornerTL} />
        <div style={styles.cornerTR} />
        <div style={styles.cornerBL} />
        <div style={styles.cornerBR} />

        <div style={styles.topBadge}>// PAYMENT SYSTEM v2.0</div>
        <h1 style={styles.pageTitle}>ORDER PAYMENT</h1>

        {/* 订单信息 */}
        <div style={styles.orderInfo}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>ORDER_NO</span>
            <code style={styles.infoCode}>{orderNo}</code>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              style={styles.copyBtn}
            >
              {copied ? 'COPIED' : 'COPY'}
            </Button>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>AMOUNT</span>
            <span style={styles.amountVal}>¥{order?.pay_amount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* 支付方式 */}
        <div style={styles.sectionLabel}>/ SELECT PAYMENT METHOD</div>
        <div style={styles.payMethods}>
          <button
            style={payMethod === 'alipay' ? styles.payBtnActive : styles.payBtn}
            onClick={() => handleChangePayMethod('alipay')}
          >
            <span style={styles.payIcon}>支</span>
            <span>支付宝</span>
          </button>
          <button
            style={payMethod === 'wxpay' ? styles.payBtnActive : styles.payBtn}
            onClick={() => handleChangePayMethod('wxpay')}
          >
            <span style={styles.payIcon}>微</span>
            <span>微信支付</span>
          </button>
        </div>

        {/* 二维码 */}
        <div style={styles.qrBox}>
          {payUrl ? (
            <QRCode
              value={payUrl}
              size={180}
              bgColor="transparent"
              color="#00f0ff"
            />
          ) : (
            <div style={styles.qrPlaceholder}>
              <Spin size="small" />
              <p style={{ color: '#4a4a6a', marginTop: 12, letterSpacing: 2 }}>LOADING QR...</p>
            </div>
          )}
        </div>

        <p style={styles.hint}>// SCAN TO PAY · DO NOT CLOSE THIS PAGE</p>

        <Button
          block
          onClick={() => loadOrder(orderNo || '')}
          style={styles.queryBtn}
        >
          我已支付，查询结果
        </Button>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px #00f0ff, 0 0 20px #00f0ff; }
          50% { text-shadow: 0 0 20px #00f0ff, 0 0 40px #00f0ff, 0 0 60px #00f0ff; }
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
  loadingBox: {
    textAlign: 'center' as const,
    padding: 120,
    position: 'relative',
    zIndex: 1,
  },
  centerBox: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '48px 32px',
    position: 'relative',
    zIndex: 1,
  },
  cornerTL: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTop: '2px solid #00f0ff',
    borderLeft: '2px solid #00f0ff',
    pointerEvents: 'none' as const,
  },
  cornerTR: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTop: '2px solid #00f0ff',
    borderRight: '2px solid #00f0ff',
    pointerEvents: 'none' as const,
  },
  cornerBL: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottom: '2px solid #ff00aa',
    borderLeft: '2px solid #ff00aa',
    pointerEvents: 'none' as const,
  },
  cornerBR: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottom: '2px solid #ff00aa',
    borderRight: '2px solid #ff00aa',
    pointerEvents: 'none' as const,
  },
  topBadge: {
    color: '#ff00aa',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 16,
    textShadow: '0 0 6px #ff00aa',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 900,
    color: '#e0e0ff',
    letterSpacing: 4,
    margin: '0 0 32px',
    textAlign: 'center' as const,
  },
  orderInfo: {
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 6,
    padding: '16px 20px',
    marginBottom: 24,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoLabel: {
    color: '#4a4a6a',
    fontSize: 11,
    letterSpacing: 2,
    minWidth: 80,
  },
  infoCode: {
    color: '#6a6a9a',
    fontSize: 12,
    letterSpacing: 1,
    flex: 1,
  },
  copyBtn: {
    background: 'rgba(0,240,255,0.08)',
    border: '1px solid rgba(0,240,255,0.3)',
    color: '#00f0ff',
    fontSize: 11,
    borderRadius: 3,
    height: 26,
  },
  amountVal: {
    color: '#ff00aa',
    fontSize: 24,
    fontWeight: 900,
    textShadow: '0 0 8px #ff00aa',
    letterSpacing: 1,
  },
  sectionLabel: {
    color: '#00f0ff',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
    textShadow: '0 0 6px rgba(0,240,255,0.5)',
  },
  payMethods: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  payBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px',
    background: 'rgba(10,10,26,0.8)',
    border: '1px solid #1a1a3a',
    borderRadius: 6,
    color: '#6a6a9a',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
    transition: 'all 0.2s',
  },
  payBtnActive: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px',
    background: 'rgba(0,240,255,0.08)',
    border: '1px solid #00f0ff',
    borderRadius: 6,
    color: '#00f0ff',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
    boxShadow: '0 0 12px rgba(0,240,255,0.2)',
    transition: 'all 0.2s',
  },
  payIcon: {
    fontSize: 16,
    fontWeight: 900,
  },
  qrBox: {
    textAlign: 'center' as const,
    padding: 24,
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 6,
    marginBottom: 16,
  },
  qrPlaceholder: {
    padding: 20,
  },
  hint: {
    color: '#4a4a6a',
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  queryBtn: {
    background: 'rgba(255,0,170,0.1)',
    border: '1px solid rgba(255,0,170,0.4)',
    color: '#ff00aa',
    fontFamily: "'Courier New', monospace",
    letterSpacing: 2,
    height: 44,
    borderRadius: 4,
  },

  // 成功页
  successBadge: {
    color: '#00f0ff',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 16,
    textShadow: '0 0 6px rgba(0,240,255,0.5)',
  },
  successIcon: {
    fontSize: 64,
    color: '#00f0ff',
    textShadow: '0 0 20px #00f0ff, 0 0 40px rgba(0,240,255,0.5)',
    textAlign: 'center' as const,
    display: 'block',
    marginBottom: 16,
    animation: 'glow 2s infinite',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 900,
    color: '#00f0ff',
    letterSpacing: 4,
    margin: '0 0 8px',
    textAlign: 'center' as const,
  },
  successOrder: {
    color: '#4a4a6a',
    fontSize: 12,
    letterSpacing: 2,
    margin: '0 0 32px',
    textAlign: 'center' as const,
  },
  cardsSection: {
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 6,
    padding: 20,
    marginBottom: 16,
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
  tips: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    padding: '12px 16px',
    background: 'rgba(255,136,0,0.08)',
    border: '1px solid rgba(255,136,0,0.3)',
    borderRadius: 4,
    marginBottom: 24,
    fontSize: 12,
    color: '#ff8800',
    letterSpacing: 1,
  },
  continueBtn: {
    width: '100%',
    background: 'rgba(0,240,255,0.1)',
    border: '1px solid rgba(0,240,255,0.4)',
    color: '#00f0ff',
    fontFamily: "'Courier New', monospace",
    letterSpacing: 2,
    height: 46,
    borderRadius: 4,
  },
}
