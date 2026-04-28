import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Tag,
  Popconfirm,
} from 'antd'
import { ShopOutlined, OrderedListOutlined, LogoutOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/request'
import { productApi } from '../api/product'

export const ManageDashboard: React.FC = () => {
  const { manageLogout } = useAuth() as any
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'products'|'orders'|'payment'>('products')
  const [contentKey, setContentKey] = useState('products')

  const handleTabChange = (tab: typeof activeTab) => {
    setContentKey(tab)
    setActiveTab(tab)
  }

  const handleLogout = () => {
    manageLogout()
    navigate('/manage/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.gridBg} />

      {/* 侧边栏 */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
      
          <div>
            <div style={styles.logoText}>CYBER CARD</div>
            <div style={styles.logoSub}>管理面板</div>
          </div>
        </div>
        <div style={styles.divider} />
        <Tag style={styles.adminTag}>管理员</Tag>
        <div style={styles.navList}>
          <button
            style={activeTab === 'products' ? styles.navItemActive : styles.navItem}
            onClick={() => handleTabChange('products')}
          >
            <ShopOutlined style={{ marginRight: 10, fontSize: 14 }} />
            <span style={{ fontFamily: "'PingFang SC', 'Courier New', monospace" }}>商品管理</span>
          </button>
          <button
            style={activeTab === 'orders' ? styles.navItemActive : styles.navItem}
            onClick={() => handleTabChange('orders')}
          >
            <OrderedListOutlined style={{ marginRight: 10, fontSize: 14 }} />
            <span style={{ fontFamily: "'PingFang SC', 'Courier New', monospace" }}>订单管理</span>
          </button>
          <button
            style={activeTab === 'payment' ? styles.navItemActive : styles.navItem}
            onClick={() => handleTabChange('payment')}
          >
            <SettingOutlined style={{ marginRight: 10, fontSize: 14 }} />
            <span style={{ fontFamily: "'PingFang SC', 'Courier New', monospace" }}>支付配置</span>
          </button>
        </div>
        <div style={styles.sidebarBottom}>
          <a href="/" style={styles.backLink}>← 返回商城</a>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            退出
          </Button>
        </div>
      </div>

      {/* 主内容 */}
      <div style={styles.main}>
        {/* 顶部 */}
        <div style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <span style={styles.topTitle}>CYBER CARD // 管理后台</span>
          </div>
          <div style={styles.topBarRight}>
            <span style={styles.online}>● ONLINE</span>
          </div>
        </div>

        {/* 内容区 */}
        <div style={styles.content}>
          <div
            key={contentKey}
            style={{ animation: 'fadeSlideIn 0.3s ease-out' }}
          >
            {activeTab === 'products' && <ProductManage />}
            {activeTab === 'orders' && <OrderManage />}
            {activeTab === 'payment' && <PaymentManage />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 支付配置 ============
const PaymentManage: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [current, setCurrent] = useState<any>(null)
  const [form] = Form.useForm()

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/payment-configs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
      })
      setConfigs(res.data || [])
    } catch {
      message.error('加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConfigs() }, [])

  const handleSubmit = async (values: any) => {
    try {
      const payload = { ...values, id: current?.id }
      if (current) {
        await api.put(`/payment-configs/${current.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
        })
      } else {
        await api.post('/payment-configs', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
        })
      }
      message.success('保存成功')
      setModalVisible(false)
      setCurrent(null)
      form.resetFields()
      fetchConfigs()
    } catch {
      message.error('保存失败')
    }
  }

  const payTypeMap: Record<string, string> = {
    alipay: '支付宝', wxpay: '微信支付', epay: '易支付',
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={styles.btnPrimary}
          onClick={() => { setCurrent(null); form.resetFields(); setModalVisible(true) }}
        >
          添加配置
        </Button>
      </div>
      <Table
        dataSource={configs}
        rowKey="id"
        loading={loading}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          {
            title: '类型', dataIndex: 'pay_type', render: (v: string) =>
              <Tag style={payTypeMap[v] === '支付宝' ? styles.tagBlue : payTypeMap[v] === '微信支付' ? styles.tagGreen : styles.tagRed}>
                {payTypeMap[v] || v}
              </Tag>,
          },
          { title: '网关地址', dataIndex: 'gateway_url', ellipsis: true },
          { title: '商户ID(PID)', dataIndex: 'pid' },
          { title: '状态', dataIndex: 'status', render: (v: number) =>
            v === 1
              ? <Tag style={styles.tagGreen}>启用</Tag>
              : <Tag style={styles.tagRed}>禁用</Tag>,
          },
          {
            title: '操作', render: (_: any, record: any) => (
              <Space>
                <Button size="small" style={styles.smallBtnPrimary} onClick={() => { setCurrent(record); form.setFieldsValue(record); setModalVisible(true) }}>编辑</Button>
                <Popconfirm title="确定删除？" onConfirm={async () => {
                  try {
                    await api.delete(`/payment-configs/${record.id}`, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
                    })
                    message.success('删除成功')
                    fetchConfigs()
                  } catch { message.error('删除失败') }
                }}>
                  <Button size="small" style={styles.smallBtnDanger}>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={modalVisible}
        title={current ? '编辑支付配置' : '添加支付配置'}
        onCancel={() => { setModalVisible(false); setCurrent(null); form.resetFields() }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
          <Form.Item name="pay_type" label="支付类型" rules={[{ required: true }]}>
            <Select placeholder="选择支付类型">
              <Select.Option value="alipay">支付宝</Select.Option>
              <Select.Option value="wxpay">微信支付</Select.Option>
              <Select.Option value="epay">易支付</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="gateway_url" label="网关地址" rules={[{ required: true }]}>
            <Input placeholder="例如：https://pay.example.com/submit.php" />
          </Form.Item>
          <Form.Item name="pid" label="商户ID (PID)" rules={[{ required: true }]}>
            <Input placeholder="输入商户ID" />
          </Form.Item>
          <Form.Item name="key" label="密钥 (Key)" rules={[{ required: true }]}>
            <Input.Password placeholder="输入密钥" />
          </Form.Item>
          <Form.Item name="notify_url" label="回调地址">
            <Input placeholder="留空则使用系统默认" />
          </Form.Item>
          <Form.Item name="return_url" label="返回地址">
            <Input placeholder="支付完成后跳转页面" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setModalVisible(false); setCurrent(null); form.resetFields() }}>取消</Button>
              <Button type="primary" htmlType="submit" style={styles.btnPrimary}>保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// ============ 商品管理 ============
const ProductManage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [current, setCurrent] = useState<any>(null)
  const [form] = Form.useForm()

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/products/merchant', {
        headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
      })
      setProducts(res.data?.list || [])
    } catch {
      message.error('加载商品失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        price: parseFloat(values.price),
        stock: parseInt(values.stock, 10),
      }
      if (current) {
        await api.put(`/products/${current.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
        })
      } else {
        await api.post('/products/merchant', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
        })
      }
      message.success('保存成功')
      setModalVisible(false)
      fetchProducts()
    } catch (err: any) {
      message.error(err?.response?.data?.message || '保存失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
      })
      message.success('删除成功')
      fetchProducts()
    } catch (err: any) {
      message.error(err?.response?.data?.message || '删除失败')
    }
  }

  const handleStatus = async (id: number, status: number) => {
    try {
      await api.put(`/products/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
      })
      message.success('状态更新成功')
      fetchProducts()
    } catch {
      message.error('更新失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '图片',
      dataIndex: 'image',
      width: 80,
      render: (v: string) =>
        v ? (
          <img
            src={`${v}`}
            alt=""
            style={{ width: 50, height: 38, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: '#4a4a6a', fontSize: 12 }}>—</span>
        ),
    },
    { title: '名称', dataIndex: 'name' },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (v: number) => <span style={{ color: '#ff00aa', fontWeight: 700 }}>¥{v?.toFixed(2)}</span>,
    },
    { title: '库存', dataIndex: 'stock', width: 80, render: (v: number) => <span style={{ color: '#4a4a6a', fontSize: 12 }}>{v ?? 0}</span> },
    { title: '已售', dataIndex: 'sold_count', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => (
        <Tag style={v === 1 ? styles.tagGreen : styles.tagRed}>
          {v === 1 ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Space size={4}>
          <Button size="small" style={styles.smallBtn} onClick={() => {
            setCurrent(record)
            form.setFieldsValue(record)
            setModalVisible(true)
          }}>编辑</Button>
          <Button size="small" style={styles.smallBtn} onClick={() => handleStatus(record.id, record.status === 1 ? 0 : 1)}>
            {record.status === 1 ? '下架' : '上架'}
          </Button>
          <Button size="small" style={styles.smallBtn} onClick={() => handleImportModal(record)}>导入</Button>
          <Button size="small" style={styles.smallBtn} onClick={() => setUploadImgModal({ visible: true, productId: record.id, name: record.name })}>图片</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger style={styles.smallBtnDanger}>删</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const [importModal, setImportModal] = useState({ visible: false, data: '' })
  const [uploadImgModal, setUploadImgModal] = useState({ visible: false, productId: 0, name: '' })
  const [uploadFile, setUploadFile] = useState<any>(null)
  const [importTarget, setImportTarget] = useState<any>(null)

  const handleImportModal = (product: any) => {
    setImportTarget(product)
    setImportModal({ visible: true, data: '' })
  }

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>商品管理</span>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={styles.addBtn}
          onClick={() => { setCurrent(null); form.resetFields(); setModalVisible(true) }}
        >
          添加商品
        </Button>
      </div>
      <Table columns={columns} dataSource={products} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      {/* 添加/编辑 */}
      <Modal
        title={current ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
            <Input placeholder="输入商品价格" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={current?.status ?? 1}>
            <Select style={{ width: '100%' }}>
              <Select.Option value={1}>上架</Select.Option>
              <Select.Option value={0}>下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入卡密 */}
      <Modal
        title={`导入卡密 - ${importTarget?.name || ''}`}
        open={importModal.visible}
        onCancel={() => setImportModal({ visible: false, data: '' })}
        footer={null}
        width={600}
      >
        <p style={{ color: '#6a6a9a', marginBottom: 8, fontSize: 12, letterSpacing: 1, fontFamily: "'PingFang SC', 'Courier New', monospace" }}>
          每行一张，格式：卡号,密码
        </p>
        <Input.TextArea
          rows={10}
          value={importModal.data}
          onChange={e => setImportModal(prev => ({ ...prev, data: e.target.value }))}
          placeholder="卡号1,密码1&#10;卡号2,密码2"
          style={{ fontFamily: "'Courier New', monospace", fontSize: 13 }}
        />
        <div style={{ marginTop: 12 }}>
          <Button
            type="primary"
            style={styles.addBtn}
            onClick={async () => {
              if (!importModal.data.trim()) { message.warning('请输入卡密'); return }
              try {
                await api.post(`/products/${importTarget.id}/cards`, { csv_data: importModal.data }, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
                })
                message.success('导入成功')
                setImportModal({ visible: false, data: '' })
                fetchProducts()
              } catch (err: any) {
                message.error(err?.response?.data?.message || '导入失败')
              }
            }}
          >
            确认导入
          </Button>
        </div>
      </Modal>

      {/* 上传图片 */}
      <Modal
        title={'上传商品图片 - ' + uploadImgModal.name}
        open={uploadImgModal.visible}
        onCancel={() => {
          setUploadImgModal({ visible: false, productId: 0, name: '' })
          setUploadFile(null)
        }}
        footer={null}
      >
        <div style={{ padding: '16px 0' }}>
          <Upload.Dragger
            name="image"
            beforeUpload={(file: any) => {
              setUploadFile(file)
              return false
            }}
            showUploadList={false}
            accept="image/*"
          >
            <p style={{ fontSize: 48, margin: 0 }}>&#x2B6F;</p>
            <p style={{ color: '#6a6a9a', marginTop: 8 }}>点击或拖拽上传图片</p>
            <p style={{ color: '#4a4a6a', fontSize: 12 }}>支持 JPG/PNG/GIF，大小不超过5MB</p>
          </Upload.Dragger>
          {uploadFile && (
            <div style={{ marginTop: 12, color: '#00f0ff', fontSize: 13 }}>
              已选: {uploadFile.name}
            </div>
          )}
          <Button
            type="primary"
            block
            style={{ marginTop: 16, border: '1px solid #00f0ff', background: 'rgba(0,240,255,0.1)', color: '#00f0ff', height: 40 }}
            onClick={async () => {
              if (!uploadFile) {
                message.warning('请先选择图片')
                return
              }
              try {
                const res: any = await productApi.uploadImage(uploadImgModal.productId, uploadFile)
                message.success('上传成功')
                setUploadImgModal({ visible: false, productId: 0, name: '' })
                setUploadFile(null)
                fetchProducts()
              } catch (err: any) {
                message.error(err?.response?.data?.message || '上传失败')
              }
            }}
          >
            确认上传
          </Button>
        </div>
      </Modal>
    </div>
  )
}


// ============ 订单管理 ============
const OrderManage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
      })
      setOrders(res.data?.list || [])
    } catch {
      message.error('加载订单失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleManualCallback = async (id: number) => {
    try {
      await api.post(`/orders/callback/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('manage_token')}` },
      })
      message.success('手动回调成功，卡密已分配')
      fetchOrders()
    } catch (err: any) {
      message.error(err?.response?.data?.message || '回调失败')
    }
  }

  const statusMap: Record<number, { color: string; text: string }> = {
    0: { color: 'orange', text: '待支付' },
    1: { color: 'blue', text: '已支付·待发货' },
    2: { color: 'green', text: '已发货' },
    3: { color: 'default', text: '已完成' },
  }

  const columns = [
    { title: '订单号', dataIndex: 'order_no', width: 180, render: (v: string) => <code style={{ color: '#6a6a9a', fontSize: 11 }}>{v}</code> },
    { title: '商品', dataIndex: ['product', 'name'] },
    { title: '数量', dataIndex: 'quantity', width: 60 },
    {
      title: '金额',
      dataIndex: 'pay_amount',
      width: 90,
      render: (v: number) => <span style={{ color: '#ff00aa', fontWeight: 700 }}>¥{v?.toFixed(2)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'pay_status',
      width: 110,
      render: (v: number) => {
        const s = statusMap[v] || { color: 'default', text: `状态${v}` }
        const tagStyle = s.color === 'green' ? styles.tagGreen :
                         s.color === 'blue' ? styles.tagBlue :
                         s.color === 'orange' ? styles.tagOrange : styles.tagGray
        return <Tag style={tagStyle}>{s.text}</Tag>
      },
    },
    { title: '买家邮箱', dataIndex: 'buyer_email', width: 180 },
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => v ? <span style={{ color: '#4a4a6a', fontSize: 11 }}>{new Date(v).toLocaleString()}</span> : '-',
    },
    {
      title: '操作',
      width: 120,
      render: (_: any, record: any) => {
        if (record.pay_status === 0) {
          return (
            <Popconfirm title="确定手动回调？将标记为已支付并分配卡密" onConfirm={() => handleManualCallback(record.id)}>
              <Button size="small" style={styles.smallBtnPrimary}>手动回调</Button>
            </Popconfirm>
          )
        }
        return <span style={{ color: '#2a2a4a', fontSize: 11 }}>-</span>
      },
    },
  ]

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>订单管理</span>
      </div>
      <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    boxSizing: 'border-box',
    background: '#050510',
    fontFamily: "'Courier New', 'PingFang SC', monospace",
    color: '#e0e0ff',
    display: 'flex',
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
  sidebar: {
    width: 220,
    background: '#0a0a1a',
    borderRight: '1px solid #1a1a3a',
    minHeight: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'relative',
    zIndex: 1,
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 20px',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 28,
    color: '#00f0ff',
    textShadow: '0 0 12px #00f0ff',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 900,
    color: '#00f0ff',
    letterSpacing: 3,
    textShadow: '0 0 6px rgba(0,240,255,0.4)',
  },
  logoSub: {
    fontSize: 9,
    color: '#ff00aa',
    letterSpacing: 2,
    marginTop: 2,
    textShadow: '0 0 4px #ff00aa',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, #1a1a3a, transparent)',
    margin: '0 16px 16px',
  },
  adminTag: {
    margin: '0 16px 16px',
    background: 'rgba(255,0,170,0.1)',
    border: '1px solid rgba(255,0,170,0.4)',
    color: '#ff00aa',
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "'PingFang SC', 'Courier New', monospace",
  },
  navList: {
    flex: 1,
    padding: '0 12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 12px',
    background: 'none',
    border: '1px solid transparent',
    color: '#4a4a6a',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: "'Courier New', monospace",
    marginBottom: 4,
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  navItemActive: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(0,240,255,0.08)',
    border: '1px solid rgba(0,240,255,0.3)',
    color: '#00f0ff',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: "'Courier New', monospace",
    marginBottom: 4,
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  sidebarBottom: {
    padding: '16px 12px 0',
    borderTop: '1px solid #1a1a3a',
    marginTop: 'auto',
  },
  backLink: {
    display: 'block',
    color: '#4a4a6a',
    textDecoration: 'none',
    fontSize: 12,
    letterSpacing: 1,
    padding: '6px 0',
    marginBottom: 4,
  },
  logoutBtn: {
    color: '#4a4a6a',
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: "'Courier New', monospace",
    width: '100%',
    textAlign: 'left',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
    minWidth: 0,
  },
  topBar: {
    background: '#0a0a1a',
    borderBottom: '1px solid #1a1a3a',
    padding: '0 32px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {},
  topTitle: {
    color: '#6a6a9a',
    fontSize: 12,
    letterSpacing: 2,
  },
  topBarRight: {},
  online: {
    color: '#00f0ff',
    fontSize: 11,
    letterSpacing: 2,
    textShadow: '0 0 6px #00f0ff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  panel: {
    background: '#0a0a14',
    border: '1px solid #1a1a3a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #1a1a3a',
  },
  panelTitle: {
    color: '#00f0ff',
    fontSize: 12,
    letterSpacing: 2,
    textShadow: '0 0 6px rgba(0,240,255,0.5)',
    fontFamily: "'PingFang SC', 'Courier New', monospace",
  },
  addBtn: {
    background: 'rgba(0,240,255,0.1)',
    border: '1px solid rgba(0,240,255,0.4)',
    color: '#00f0ff',
    borderRadius: 4,
    fontFamily: "'PingFang SC', 'Courier New', monospace",
    fontSize: 12,
    letterSpacing: 1,
  },
  smallBtn: {
    background: 'rgba(0,240,255,0.06)',
    border: '1px solid rgba(0,240,255,0.2)',
    color: '#00f0ff',
    borderRadius: 3,
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    height: 26,
  },
  smallBtnDanger: {
    background: 'rgba(255,51,102,0.06)',
    border: '1px solid rgba(255,51,102,0.2)',
    color: '#ff3366',
    borderRadius: 3,
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    height: 26,
    width: 34,
  },
  smallBtnPrimary: {
    background: 'rgba(0,240,255,0.1)',
    border: '1px solid rgba(0,240,255,0.3)',
    color: '#00f0ff',
    borderRadius: 3,
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    height: 26,
  },
  tagGreen: {
    background: 'rgba(0,240,255,0.1)',
    border: '1px solid rgba(0,240,255,0.4)',
    color: '#00f0ff',
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "'PingFang SC', 'Courier New', monospace",
  },
  tagRed: {
    background: 'rgba(255,51,102,0.1)',
    border: '1px solid rgba(255,51,102,0.4)',
    color: '#ff3366',
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "'PingFang SC', 'Courier New', monospace",
  },
  tagBlue: {
    background: 'rgba(0,136,255,0.1)',
    border: '1px solid rgba(0,136,255,0.4)',
    color: '#0088ff',
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "'PingFang SC', 'Courier New', monospace",
  },
  tagOrange: {
    background: 'rgba(255,136,0,0.1)',
    border: '1px solid rgba(255,136,0,0.4)',
    color: '#ff8800',
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "'PingFang SC', 'Courier New', monospace",
  },
  tagGray: {
    background: 'rgba(74,74,106,0.1)',
    border: '1px solid rgba(74,74,106,0.4)',
    color: '#4a4a6a',
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "'PingFang SC', 'Courier New', monospace",
  },
}
