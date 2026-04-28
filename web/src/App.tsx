import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Store } from './pages/Store'
import { ProductBuy } from './pages/ProductBuy'
import { Payment } from './pages/Payment'
import { OrderQuery } from './pages/OrderQuery'
import { ManageLogin } from './pages/ManageLogin'
import { ManageDashboard } from './pages/ManageDashboard'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Navigate } from 'react-router-dom'

// 保护管理后台路由
const ManageRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { manageToken, manageLoading } = useAuth() as any
  if (manageLoading) return null
  return manageToken ? <>{children}</> : <Navigate to="/manage/login" />
}

function AppRoutes() {
  return (
    <Routes>
      {/* 买家商城 */}
      <Route path="/" element={<Store />} />
      <Route path="/buy/:id" element={<ProductBuy />} />
      <Route path="/pay/:orderNo" element={<Payment />} />
      <Route path="/query" element={<OrderQuery />} />

      {/* 管理后台（隐藏路由） */}
      <Route path="/manage/login" element={<ManageLogin />} />
      <Route
        path="/manage"
        element={
          <ManageRoute>
            <ManageDashboard />
          </ManageRoute>
        }
      />

      {/* 其他 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App