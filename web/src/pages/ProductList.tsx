import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tag,
  Popconfirm,
  Upload,
} from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { productApi, type Product } from '../api/product'

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [form] = Form.useForm()

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res: any = await productApi.merchantList()
      setProducts(res.data.list || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleCreate = () => {
    setCurrentProduct(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Product) => {
    setCurrentProduct(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await productApi.delete(id)
      message.success('删除成功')
      fetchProducts()
    } catch (err: any) {
      message.error(err.message || '删除失败')
    }
  }

  const handleStatusChange = async (id: number, status: number) => {
    try {
      await productApi.updateStatus(id, status)
      message.success('状态更新成功')
      fetchProducts()
    } catch (err: any) {
      message.error(err.message || '更新失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (currentProduct) {
        await productApi.update(currentProduct.id, values)
        message.success('更新成功')
      } else {
        await productApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchProducts()
    } catch (err: any) {
      message.error(err.message || '操作失败')
    }
  }

  const handleImport = async (productId: number, csvData: string) => {
    try {
      const res: any = await productApi.importCards(productId, csvData)
      message.success(`成功导入 ${res.data.count} 张卡密`)
      setImportModalVisible(false)
      fetchProducts()
    } catch (err: any) {
      message.error(err.message || '导入失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '已售', dataIndex: 'sold_count', key: 'sold_count' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) => (
        <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '上架' : '下架'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            size="small"
            onClick={() => handleStatusChange(record.id, record.status === 1 ? 0 : 1)}
          >
            {record.status === 1 ? '下架' : '上架'}
          </Button>
          <Button
            size="small"
            onClick={() => {
              setCurrentProduct(record)
              setImportModalVisible(true)
            }}
          >
            导入卡密
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          添加商品
        </Button>
      </div>

      <Table columns={columns} dataSource={products} rowKey="id" loading={loading} />

      <Modal
        title={currentProduct ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="导入卡密"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <ImportForm productId={currentProduct?.id || 0} onImport={handleImport} />
      </Modal>
    </div>
  )
}

const ImportForm: React.FC<{ productId: number; onImport: (id: number, data: string) => void }> = ({
  productId,
  onImport,
}) => {
  const [csvData, setCsvData] = useState('')

  return (
    <div>
      <p>格式：每行一张卡，支持 CSV 格式（卡号,卡密）</p>
      <Input.TextArea
        rows={10}
        value={csvData}
        onChange={(e) => setCsvData(e.target.value)}
        placeholder="卡号1,卡密1&#10;卡号2,卡密2&#10;..."
      />
      <Button
        type="primary"
        style={{ marginTop: 16 }}
        onClick={() => onImport(productId, csvData)}
      >
        导入
      </Button>
    </div>
  )
}
