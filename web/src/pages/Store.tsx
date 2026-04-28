import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Spin, Empty, Input, Button, Tag, Menu, Drawer } from 'antd'
import {
  SearchOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import { productApi } from '../api/product'
import type { Product } from '../api/product'

const { Meta } = Card

export const Store: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res: any = await productApi.list(1, 50)
      const validProducts = (res.data?.list || res.data || []).filter(
        (p: Product) => p.status === 1
      )
      setProducts(validProducts)
    } catch (err) {
      console.error('加载商品失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(keyword.toLowerCase())
  )

  const getStockStatus = (stock: number) => {
    if (stock === 0) return <Tag style={styles.tagRed}>缺货</Tag>
    if (stock < 10) return <Tag style={styles.tagOrange}>库存紧张</Tag>
    return <Tag style={styles.tagGreen}>有货</Tag>
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
            <span style={styles.logoLine} />
          </Link>

  
          <div style={styles.desktopNav}>
 
            <Link to="/query" style={{ ...styles.navLink, ...styles.navLinkActive }}>
              查询订单
            </Link>
          </div>

          {/* 移动端 */}
          <button style={styles.hamburger} onClick={() => setDrawerOpen(true)}>
            <MenuOutlined style={{ color: '#00f0ff', fontSize: 20 }} />
          </button>
        </div>
        <div style={styles.navScan} />
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        {/* 网格背景 */}
        <div style={styles.gridBg} />
        <div style={styles.overlay} />

        {/* 扫描线 */}
        <div style={styles.scanLine} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>// vx-LLOOVVEE_LL  </div>
          <h1 style={styles.heroTitle}>
            <span style={styles.titleCyber}>CYBER</span>
            <span style={styles.titleSlash}> / </span>
            <span style={styles.titleShop}>SHOP</span>
          </h1>
          <p style={styles.heroSub}> 秒级交付 · 数字商品直通车</p>
        </div>

        {/* 搜索 */}
        <div style={styles.heroSearch}>
          <div style={styles.searchWrap}>
            <Input
              size="large"
              placeholder="输入关键词搜索商品..."
              prefix={<SearchOutlined style={{ color: '#00f0ff' }} />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* 角落装饰 */}
        <div style={styles.cornerTL} />
        <div style={styles.cornerTR} />
        <div style={styles.cornerBL} />
        <div style={styles.cornerBR} />
      </div>

      {/* 商品列表 */}
      <div style={styles.main}>
        {filteredProducts.length > 0 && (
          <div style={styles.sectionHeader}>
            <div style={styles.sectionLine} />
            <span style={styles.sectionTitle}>// 商品列表</span>
            <span style={styles.sectionCount}>[{filteredProducts.length}]</span>
            <div style={styles.sectionLine} />
          </div>
        )}

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.loaderRing} />
            <p style={{ color: '#00f0ff', marginTop: 20, fontFamily: 'monospace' }}>
              LOADING SYSTEM...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={styles.emptyWrap}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#4a4a6a' }}>
                  {keyword ? '// 无搜索结果' : '// 暂无商品'}
                </span>
              }
            />
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                hoverable
                cover={
                  <div style={styles.cardCover}>
                    <div style={styles.cardGridBg} />
                    <img
                      alt={product.name}
                      src={product.image || `https://picsum.photos/seed/${product.id}/400/300`}
                      style={styles.productImage}
                    />
                    <div style={styles.cardOverlay} />
                    <div style={styles.cardPrice}>
                      <span style={styles.priceUnit}>¥</span>
                      <span style={styles.priceNum}>{product.price.toFixed(2)}</span>
                    </div>
                    <div style={styles.cardIdTag}>#{product.id}</div>
                    {product.stock === 0 && (
                      <div style={styles.soldOutOverlay}>
                        <span style={styles.soldOutText}>SOLD OUT</span>
                      </div>
                    )}
                  </div>
                }
                style={styles.card}
                bodyStyle={{ padding: '14px', background: '#0a0a14' }}
                onClick={() => product.stock > 0 && navigate(`/buy/${product.id}`)}
              >
                <div style={styles.cardBody}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <div style={styles.cardMeta}>
                    <span style={styles.soldCount}>已售: {product.sold_count || 0}</span>
                    {getStockStatus(product.stock)}
                  </div>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    block
                    style={product.stock === 0 ? styles.buyBtnDisabled : styles.buyBtn}
                    disabled={product.stock === 0}
                    onClick={e => {
                      e.stopPropagation()
                      if (product.stock > 0) navigate(`/buy/${product.id}`)
                    }}
                  >
                    {product.stock === 0 ? '[ 暂不可购买 ]' : '[ 立即购买 ]'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 底部 */}
      <div style={styles.footer}>
        <div style={styles.footerLine} />
        <p style={{ margin: '12px 0 0', color: '#3a3a5a', fontSize: 12, fontFamily: 'monospace' }}>
          
        </p>
      </div>

      {/* 移动端抽屉 */}
      <Drawer
        title={null}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={260}
        styles={{
          body: { padding: 0, background: '#0d0d1a' },
          header: { background: '#0d0d1a', borderBottom: '1px solid #1a1a3a' },
        }}
      >
        <div style={styles.drawerHeader}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={{ color: '#00f0ff', fontFamily: 'monospace', fontWeight: 700 }}>
            CYBER CARD
          </span>
        </div>

        <Link to="/query" onClick={() => setDrawerOpen(false)} style={styles.drawerLink}>
          <SearchOutlined /> 查询订单
        </Link>
      </Drawer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #050510; }
        .ant-card-hoverable:hover {
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.25) !important;
          border-color: rgba(0, 240, 255, 0.3) !important;
        }
        .ant-input:focus {
          border-color: #00f0ff !important;
          box-shadow: 0 0 12px rgba(0, 240, 255, 0.3) !important;
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
          .hero { padding: 32px 16px !important; min-height: 200px !important; }
          .hero-title { font-size: 28px !important; }
          .hero-sub { font-size: 11px !important; }
          .hero-search { padding: 0 !important; }
          .main { padding: 24px 12px 40px !important; }
          .grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .card-cover { height: 130px !important; }
          .product-name { font-size: 12px !important; }
          .footer { padding: 20px 16px !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
        }
        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
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
  },

  // 导航
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
    animation: 'pulse 2s infinite',
  },
  navInner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: 60,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: 24,
    color: '#00f0ff',
    textShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#00f0ff',
    letterSpacing: 3,
    textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
  },
  logoLine: {
    width: 1,
    height: 20,
    background: '#1a1a3a',
    marginLeft: 8,
  },
  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  navLink: {
    textDecoration: 'none',
    color: '#6a6a9a',
    fontSize: 13,
    padding: '6px 18px',
    borderRadius: 4,
    border: '1px solid transparent',
    transition: 'all 0.2s',
    letterSpacing: 1,
  },
  navLinkActive: {
    color: '#00f0ff',
    borderColor: '#00f0ff',
    textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
    background: 'rgba(0, 240, 255, 0.05)',
  },
  hamburger: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    border: '1px solid #1a1a3a',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 4,
  },

  // Hero
  hero: {
    position: 'relative',
    background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d25 100%)',
    padding: '64px 32px 48px',
    textAlign: 'center' as const,
    overflow: 'hidden',
    borderBottom: '1px solid #1a1a3a',
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none' as const,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none' as const,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.4), transparent)',
    animation: 'scan 4s linear infinite',
    pointerEvents: 'none' as const,
  },
  heroContent: { position: 'relative', zIndex: 2 },
  heroBadge: {
    color: '#ff00aa',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 16,
    textShadow: '0 0 8px #ff00aa',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 900,
    margin: '0 0 16px',
    letterSpacing: 6,
    lineHeight: 1.2,
  },
  titleCyber: {
    color: '#00f0ff',
    textShadow: '0 0 20px #00f0ff, 0 0 40px rgba(0,240,255,0.5)',
  },
  titleSlash: {
    color: '#ff00aa',
    textShadow: '0 0 10px #ff00aa',
  },
  titleShop: {
    color: '#f0f0ff',
    textShadow: '0 0 10px rgba(240,240,255,0.3)',
  },
  heroSub: {
    color: '#6a6a9a',
    fontSize: 14,
    letterSpacing: 2,
    margin: 0,
  },
  heroSearch: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 520,
    margin: '32px auto 0',
    padding: '0 24px',
  },
  searchWrap: {
    border: '1px solid #1a1a3a',
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
  },
  searchInput: {
    background: 'rgba(10, 10, 26, 0.9)',
    border: '1px solid #1a1a3a',
    borderRadius: 0,
    color: '#e0e0ff',
    height: 50,
    fontSize: 14,
    letterSpacing: 1,
  },

  // 角落装饰
  cornerTL: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderTop: '2px solid #00f0ff',
    borderLeft: '2px solid #00f0ff',
    pointerEvents: 'none' as const,
  },
  cornerTR: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderTop: '2px solid #00f0ff',
    borderRight: '2px solid #00f0ff',
    pointerEvents: 'none' as const,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 24,
    height: 24,
    borderBottom: '2px solid #ff00aa',
    borderLeft: '2px solid #ff00aa',
    pointerEvents: 'none' as const,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 24,
    height: 24,
    borderBottom: '2px solid #ff00aa',
    borderRight: '2px solid #ff00aa',
    pointerEvents: 'none' as const,
  },

  // 商品区域
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 32px 60px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, transparent, #1a1a3a, transparent)',
  },
  sectionTitle: {
    color: '#00f0ff',
    fontSize: 14,
    letterSpacing: 3,
    textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
    whiteSpace: 'nowrap' as const,
  },
  sectionCount: {
    color: '#ff00aa',
    fontSize: 14,
    textShadow: '0 0 8px rgba(255, 0, 170, 0.5)',
  },
  loading: {
    textAlign: 'center' as const,
    padding: 80,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loaderRing: {
    width: 48,
    height: 48,
    border: '2px solid #1a1a3a',
    borderTopColor: '#00f0ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyWrap: { padding: 80 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 20,
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #1a1a3a',
    background: '#0a0a14',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  cardCover: {
    position: 'relative',
    height: 180,
    overflow: 'hidden',
    background: '#0d0d1a',
  },
  cardGridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    pointerEvents: 'none' as const,
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    filter: 'brightness(0.8) saturate(1.2)',
  },
  cardOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(transparent 50%, rgba(10, 10, 20, 0.9) 100%)',
    pointerEvents: 'none' as const,
  },
  cardPrice: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    display: 'flex',
    alignItems: 'baseline',
    gap: 2,
  },
  priceUnit: {
    color: '#ff00aa',
    fontSize: 13,
    fontWeight: 700,
    textShadow: '0 0 8px #ff00aa',
  },
  priceNum: {
    color: '#ff00aa',
    fontSize: 22,
    fontWeight: 900,
    textShadow: '0 0 10px #ff00aa, 0 0 20px rgba(255,0,170,0.4)',
  },
  cardIdTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    color: '#00f0ff',
    fontSize: 10,
    letterSpacing: 1,
    background: 'rgba(0, 240, 255, 0.1)',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    padding: '2px 8px',
    borderRadius: 2,
    textShadow: '0 0 6px #00f0ff',
  },
  soldOutOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(5, 5, 16, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    color: '#ff3366',
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 4,
    textShadow: '0 0 12px #ff3366',
    animation: 'glitch 2s infinite',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e0e0ff',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    letterSpacing: 1,
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soldCount: {
    color: '#4a4a6a',
    fontSize: 11,
    letterSpacing: 1,
  },
  tagRed: {
    background: 'rgba(255, 51, 102, 0.15)',
    border: '1px solid #ff3366',
    color: '#ff3366',
    fontSize: 10,
    letterSpacing: 1,
  },
  tagOrange: {
    background: 'rgba(255, 136, 0, 0.15)',
    border: '1px solid #ff8800',
    color: '#ff8800',
    fontSize: 10,
    letterSpacing: 1,
  },
  tagGreen: {
    background: 'rgba(0, 240, 255, 0.1)',
    border: '1px solid #00f0ff',
    color: '#00f0ff',
    fontSize: 10,
    letterSpacing: 1,
  },
  buyBtn: {
    border: '1px solid #00f0ff',
    background: 'rgba(0, 240, 255, 0.1)',
    color: '#00f0ff',
    borderRadius: 4,
    fontWeight: 700,
    height: 36,
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "'Courier New', monospace",
    boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
  },
  buyBtnDisabled: {
    border: '1px solid #2a2a4a',
    background: 'rgba(42, 42, 74, 0.2)',
    color: '#4a4a6a',
    borderRadius: 4,
    fontWeight: 700,
    height: 36,
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "'Courier New', monospace",
  },

  // 底部
  footer: {
    padding: '24px 32px',
    textAlign: 'center' as const,
    borderTop: '1px solid #1a1a3a',
    background: '#050510',
  },
  footerLine: {
    width: 60,
    height: 2,
    background: 'linear-gradient(90deg, #00f0ff, #ff00aa)',
    margin: '0 auto 12px',
    borderRadius: 1,
  },

  // 抽屉
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 20px',
    borderBottom: '1px solid #1a1a3a',
    fontSize: 16,
    fontWeight: 700,
  },
  drawerLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 20px',
    color: '#6a6a9a',
    textDecoration: 'none',
    fontSize: 14,
    borderBottom: '1px solid #0d0d1a',
    letterSpacing: 1,
  },
}
