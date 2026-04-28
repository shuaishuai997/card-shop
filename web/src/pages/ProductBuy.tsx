import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Card,
  Spin,
  Button,
  InputNumber,
  Input,
  message,
  Row,
  Col,
  Breadcrumb,
} from 'antd'
import {
  ShoppingCartOutlined,
  HomeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { productApi } from '../api/product'
import type { Product } from '../api/product'

export const ProductBuy: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [buyerEmail, setBuyerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) loadProduct(parseInt(id))
  }, [id])

  const loadProduct = async (productId: number) => {
    try {
      const res: any = await productApi.get(productId)
      setProduct(res.data)
    } catch {
      message.error('商品不存在')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!product) return
    if (!buyerEmail) {
      message.warning('请填写邮箱')
      return
    }
    try {
      setSubmitting(true)
      const res: any = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          buyer_email: buyerEmail,

        }),
      }).then(r => r.json())

      if (res.code !== 0) {
        message.error(res.message || '下单失败')
        return
      }
      const orderNo = res.data?.order_no
      if (orderNo) navigate(`/pay/${orderNo}`)
    } catch {
      message.error('下单失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <Spin size="large" />
          <p style={{ color: '#00f0ff', marginTop: 20, fontFamily: 'monospace', letterSpacing: 2 }}>
            系统加载中...
          </p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <div style={styles.center}>
          <p style={styles.errText}>// 商品详情 NOT FOUND</p>
          <Link to="/" style={styles.backLink}>← 返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 顶部导航 */}
      <div style={styles.navbar}>
        <div style={styles.navScan} />
        <div style={styles.navInner}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>⬡</span>
            <span style={styles.logoText}>CYBER CARD</span>
          </Link>
          <Link to="/" style={styles.backBtn}>
            <HomeOutlined /> 返回商城
          </Link>
        </div>
        <div style={styles.navScan} />
      </div>

      {/* 网格背景 */}
      <div style={styles.gridBg} />

      <div style={styles.content}>
        {/* 面包屑 */}
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { title: <Link to="/" style={{ color: '#6a6a9a' }}>首页</Link> },
            { title: <span style={{ color: '#00f0ff' }}>商品详情</span> },
          ]}
        />

        <Row gutter={48}>
          {/* 左侧图片 */}
          <Col xs={24} md={10}>
            <div style={styles.imageWrap}>
              <div style={styles.imageCornerTL} />
              <div style={styles.imageCornerTR} />
              <div style={styles.imageCornerBL} />
              <div style={styles.imageCornerBR} />
              <img
                src={product.image || `https://picsum.photos/seed/${product.id}/500/400`}
                alt={product.name}
                style={styles.productImage}
              />
              <div style={styles.imageIdTag}>#{product.id}</div>
            </div>
          </Col>

          {/* 右侧信息 */}
          <Col xs={24} md={14}>
            {/* 标题 */}
            <div style={styles.titleSection}>
              <div style={styles.titleId}>// 商品_{product.id}</div>
              <h1 style={styles.productName}>{product.name}</h1>
              <div style={styles.tagRow}>
                <span style={product.stock > 0 ? styles.tagGreen : styles.tagRed}>
                  {product.stock > 0 ? `[ 有货: ${product.stock} ]` : '[ 缺货 ]'}
                </span>
                <span style={styles.soldCount}>已售: {product.sold_count || 0}</span>
              </div>
            </div>

            {/* 价格 */}
            <div style={styles.priceBox}>
              <div style={styles.priceLeft}>
                <span style={styles.priceUnit}>¥</span>
                <span style={styles.priceValue}>{product.price.toFixed(2)}</span>
              </div>
              <span style={styles.priceUnitLabel}>/ 件</span>
            </div>

            <div style={styles.divider} />

            {/* 描述 */}
            <div style={styles.descSection}>
              <div style={styles.sectionLabel}>// 商品描述</div>
              <p style={styles.descText}>
                {product.description || '数字商品，自动发货，购买后秒级收到卡密。'}
              </p>
            </div>

            {/* 特性 */}
            <div style={styles.features}>
              {[
                { icon: '⚡', text: '自动发货' },
                { icon: '🔒', text: '资金托管' },
                { icon: '📧', text: '卡密到邮箱' },
              ].map((f, i) => (
                <div key={i} style={styles.featureItem}>
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <span style={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>

            <div style={styles.divider} />

            {/* 购买表单 */}
            <div style={styles.orderForm}>
              <div style={styles.sectionLabel}>// 购买信息</div>

              <div style={styles.formRow}>
                <span style={styles.formLabel}>数量</span>
                <Input
                  placeholder="请输入购买数量"
                  value={quantity}
                  onChange={e => {
                    const v = e.target.value
                    const n = parseInt(v, 10)
                    if (!isNaN(n) && n > 0) {
                      setQuantity(n)
                    } else if (v === '') {
                      setQuantity(1)
                    }
                  }}
                  onBlur={e => {
                    const v = e.target.value
                    const n = parseInt(v, 10)
                    if (isNaN(n) || n < 1) {
                      setQuantity(1)
                      message.warning('数量最少为1')
                    } else if (product && n > product.stock) {
                      setQuantity(product.stock)
                      message.warning(`库存不足，最多${product.stock}`)
                    }
                  }}
                  style={styles.input}
                />
                <span style={styles.formHint}>MAX: {product.stock}</span>
              </div>

              <div style={styles.formRow}>
                <span style={styles.formLabel}>
                  邮箱 <span style={{ color: '#ff3366' }}>*</span>
                </span>
                <Input
                  placeholder="用于接收卡密，请务必填写正确"
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                  style={styles.input}
                />
              </div>

              {/* 总额 */}
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>合计</span>
                <span style={styles.totalValue}>¥{(product.price * quantity).toFixed(2)}</span>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                block
                loading={submitting}
                onClick={handleBuy}
                disabled={product.stock === 0}
                style={product.stock === 0 ? styles.buyBtnDisabled : styles.buyBtn}
              >
                {product.stock === 0 ? '[ 暂不可购买 ]' : '[ 提交订单 ]'}
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @media (max-width: 768px) {
          .content { padding: 20px 16px !important; }
          .image-wrap { margin-bottom: 24px !important; }
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
      linear-gradient(rgba(0,240,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,240,255,0.025) 1px, transparent 1px)
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
    textShadow: '0 0 8px rgba(0,240,255,0.5)',
  },
  backBtn: {
    color: '#6a6a9a',
    textDecoration: 'none',
    fontSize: 13,
    letterSpacing: 1,
    transition: 'color 0.2s',
  },
  loadingBox: {
    textAlign: 'center',
    padding: 120,
    position: 'relative',
    zIndex: 1,
  },
  center: {
    textAlign: 'center',
    padding: 120,
    position: 'relative',
    zIndex: 1,
  },
  errText: {
    color: '#ff3366',
    fontSize: 20,
    marginBottom: 20,
    textShadow: '0 0 10px #ff3366',
  },
  backLink: {
    color: '#00f0ff',
    textDecoration: 'none',
    letterSpacing: 1,
  },
  content: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 0',
    position: 'relative',
    zIndex: 1,
  },
  imageWrap: {
    position: 'relative',
    border: '1px solid #1a1a3a',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#0a0a14',
  },
  imageCornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderTop: '2px solid #00f0ff',
    borderLeft: '2px solid #00f0ff',
    zIndex: 2,
    pointerEvents: 'none',
  },
  imageCornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderTop: '2px solid #00f0ff',
    borderRight: '2px solid #00f0ff',
    zIndex: 2,
    pointerEvents: 'none',
  },
  imageCornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 20,
    height: 20,
    borderBottom: '2px solid #ff00aa',
    borderLeft: '2px solid #ff00aa',
    zIndex: 2,
    pointerEvents: 'none',
  },
  imageCornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderBottom: '2px solid #ff00aa',
    borderRight: '2px solid #ff00aa',
    zIndex: 2,
    pointerEvents: 'none',
  },
  productImage: {
    width: '100%',
    display: 'block',
    filter: 'brightness(0.85) saturate(1.3)',
  },
  imageIdTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(0,240,255,0.1)',
    border: '1px solid rgba(0,240,255,0.3)',
    color: '#00f0ff',
    fontSize: 10,
    letterSpacing: 1,
    padding: '2px 8px',
    borderRadius: 2,
  },
  titleSection: { marginBottom: 20 },
  titleId: {
    color: '#ff00aa',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
    textShadow: '0 0 6px #ff00aa',
  },
  productName: {
    fontSize: 28,
    fontWeight: 900,
    color: '#e0e0ff',
    margin: '0 0 12px',
    letterSpacing: 2,
    lineHeight: 1.3,
  },
  tagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  tagGreen: {
    color: '#00f0ff',
    fontSize: 12,
    letterSpacing: 1,
    border: '1px solid rgba(0,240,255,0.4)',
    background: 'rgba(0,240,255,0.08)',
    padding: '3px 10px',
    borderRadius: 3,
  },
  tagRed: {
    color: '#ff3366',
    fontSize: 12,
    letterSpacing: 1,
    border: '1px solid rgba(255,51,102,0.4)',
    background: 'rgba(255,51,102,0.08)',
    padding: '3px 10px',
    borderRadius: 3,
  },
  soldCount: {
    color: '#4a4a6a',
    fontSize: 12,
    letterSpacing: 1,
  },
  priceBox: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    background: 'rgba(0,240,255,0.05)',
    border: '1px solid rgba(0,240,255,0.2)',
    padding: '20px 24px',
    borderRadius: 6,
    marginBottom: 20,
  },
  priceLeft: {
    display: 'flex',
    alignItems: 'baseline',
  },
  priceUnit: {
    color: '#ff00aa',
    fontSize: 18,
    fontWeight: 700,
    textShadow: '0 0 8px #ff00aa',
  },
  priceValue: {
    color: '#ff00aa',
    fontSize: 42,
    fontWeight: 900,
    textShadow: '0 0 12px #ff00aa, 0 0 24px rgba(255,0,170,0.3)',
  },
  priceUnitLabel: {
    color: '#4a4a6a',
    fontSize: 13,
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, #1a1a3a, transparent)',
    margin: '20px 0',
  },
  descSection: { marginBottom: 16 },
  sectionLabel: {
    color: '#00f0ff',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
    textShadow: '0 0 6px rgba(0,240,255,0.5)',
  },
  descText: {
    color: '#6a6a9a',
    lineHeight: 1.8,
    fontSize: 14,
  },
  features: {
    display: 'flex',
   
    gap: 8,
    marginBottom: 4,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    color: '#6a6a9a',
  },
  featureIcon: { fontSize: 16 },
  featureText: { letterSpacing: 1 },
  orderForm: {
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 8,
    padding: 24,
  },
  formRow: {
    marginBottom: 16,
  },
  formLabel: {
    display: 'block',
    color: '#6a6a9a',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    background: '#050510',
    border: '1px solid #1a1a3a',
    color: '#e0e0ff',
    borderRadius: 4,
    height: 40,
    fontFamily: "'Courier New', monospace",
  },
  inputNumber: {
    background: '#050510',
    border: '1px solid #1a1a3a',
    borderRadius: 4,
    height: 40,
    width: '100%',
    color: '#e0e0ff',
  },
  formHint: {
    color: '#4a4a6a',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 4,
    display: 'block',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderTop: '1px solid #1a1a3a',
    borderBottom: '1px solid #1a1a3a',
    marginBottom: 16,
  },
  totalLabel: {
    color: '#6a6a9a',
    fontSize: 13,
    letterSpacing: 2,
  },
  totalValue: {
    color: '#ff00aa',
    fontSize: 28,
    fontWeight: 900,
    textShadow: '0 0 10px #ff00aa',
  },
  buyBtn: {
    border: '1px solid #00f0ff',
    background: 'rgba(0,240,255,0.1)',
    color: '#00f0ff',
    borderRadius: 4,
    fontWeight: 700,
    height: 50,
    fontSize: 15,
    letterSpacing: 3,
    fontFamily: "'Courier New', monospace",
    boxShadow: '0 0 15px rgba(0,240,255,0.2)',
  },
  buyBtnDisabled: {
    border: '1px solid #2a2a4a',
    background: 'rgba(42,42,74,0.2)',
    color: '#4a4a6a',
    borderRadius: 4,
    fontWeight: 700,
    height: 50,
    fontSize: 15,
    letterSpacing: 3,
    fontFamily: "'Courier New', monospace",
  },
}
