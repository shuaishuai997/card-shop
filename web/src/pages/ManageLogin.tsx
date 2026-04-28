import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Tabs } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/request'

export const ManageLogin: React.FC = () => {
  const navigate = useNavigate()
  const { manageLogin } = useAuth() as any
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('admin')

  const onAdminLogin = async (values: { password: string }) => {
    try {
      setLoading(true)
      const res: any = await api.post('/login', {
        username: 'admin',
        password: values.password,
      })
      if (res.code === 0) {
        manageLogin(res.data?.token || 'admin-token')
        message.success('管理员登录成功')
        navigate('/manage')
      } else {
        message.error(res.message || '登录失败')
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* 背景网格 */}
      <div style={styles.gridBg} />
      <div style={styles.scanLine} />

      <div style={styles.cardWrap}>
        {/* 装饰角 */}
        <div style={styles.c1} />
        <div style={styles.c2} />
        <div style={styles.c3} />
        <div style={styles.c4} />

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <div>
            <div style={styles.logoText}>CYBER CARD</div>
            <div style={styles.logoSub}>后台入口 // v2.0</div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Tab 切换 */}
        <div style={styles.tabs}>
          <button
            style={activeTab === 'admin' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('admin')}
          >
            管理员
          </button>
        </div>

        {/* 管理员登录 */}
        {activeTab === 'admin' && (
          <Form onFinish={onAdminLogin} layout="vertical">
            <div style={styles.label}>// 管理员密码</div>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入管理员密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#00f0ff' }} />}
                placeholder="输入管理员密码"
                size="large"
                style={styles.input}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={styles.submitBtn}
            >
              [ 进入后台 ]
            </Button>
          </Form>
        )}

        <div style={styles.footer}>
          <a href="/" style={styles.backLink}>← 返回商城</a>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  scanLine: {
    position: 'fixed',
    left: 0,
    right: 0,
    height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.3), transparent)',
    animation: 'scan 4s linear infinite',
    pointerEvents: 'none',
  },
  cardWrap: {
    width: 400,
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 8,
    padding: '40px 36px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 0 40px rgba(0,0,0,0.5)',
  },
  c1: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 24,
    height: 24,
    borderTop: '2px solid #00f0ff',
    borderLeft: '2px solid #00f0ff',
    pointerEvents: 'none',
  },
  c2: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 24,
    height: 24,
    borderTop: '2px solid #00f0ff',
    borderRight: '2px solid #00f0ff',
    pointerEvents: 'none',
  },
  c3: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 24,
    height: 24,
    borderBottom: '2px solid #ff00aa',
    borderLeft: '2px solid #ff00aa',
    pointerEvents: 'none',
  },
  c4: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 24,
    height: 24,
    borderBottom: '2px solid #ff00aa',
    borderRight: '2px solid #ff00aa',
    pointerEvents: 'none',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 36,
    color: '#00f0ff',
    textShadow: '0 0 15px #00f0ff, 0 0 30px rgba(0,240,255,0.4)',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 900,
    color: '#00f0ff',
    letterSpacing: 4,
    textShadow: '0 0 8px rgba(0,240,255,0.5)',
  },
  logoSub: {
    fontSize: 10,
    color: '#ff00aa',
    letterSpacing: 2,
    marginTop: 4,
    textShadow: '0 0 6px #ff00aa',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, #1a1a3a, transparent)',
    marginBottom: 24,
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 28,
    borderBottom: '1px solid #1a1a3a',
    paddingBottom: 12,
  },
  tab: {
    background: 'none',
    border: '1px solid #1a1a3a',
    color: '#4a4a6a',
    padding: '6px 20px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: "'Courier New', monospace",
  },
  tabActive: {
    background: 'rgba(0,240,255,0.08)',
    border: '1px solid #00f0ff',
    color: '#00f0ff',
    padding: '6px 20px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: "'Courier New', monospace",
    boxShadow: '0 0 8px rgba(0,240,255,0.2)',
  },
  label: {
    color: '#00f0ff',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
    textShadow: '0 0 6px rgba(0,240,255,0.5)',
  },
  input: {
    background: '#050510',
    border: '1px solid #1a1a3a',
    color: '#e0e0ff',
    borderRadius: 4,
    height: 48,
    fontFamily: "'Courier New', monospace",
  },
  submitBtn: {
    background: 'rgba(0,240,255,0.1)',
    border: '1px solid #00f0ff',
    color: '#00f0ff',
    borderRadius: 4,
    fontWeight: 700,
    height: 50,
    fontSize: 14,
    letterSpacing: 3,
    fontFamily: "'Courier New', monospace",
    boxShadow: '0 0 15px rgba(0,240,255,0.2)',
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    textAlign: 'center' as const,
  },
  backLink: {
    color: '#4a4a6a',
    textDecoration: 'none',
    fontSize: 12,
    letterSpacing: 1,
    transition: 'color 0.2s',
  },
}
