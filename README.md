# 发卡网系统

基于 Go + React 的多商户发卡系统。

## 功能特性

- ✅ 多商户入驻
- ✅ 商品管理
- ✅ 卡密批量导入
- ✅ 自动发卡
- ✅ 易支付对接（支付宝/微信）
- ✅ 订单管理
- ✅ 优惠券系统
- ✅ 买家订单查询

## 技术栈

**后端:**
- Go 1.21+
- Gin (Web框架)
- GORM (ORM)
- SQLite / MySQL
- JWT 认证

**前端:**
- React 18
- TypeScript
- Ant Design
- Vite

## 快速开始

### 后端启动

```bash
cd card-shop
go mod tidy
go run cmd/server/main.go
```

### 前端启动

```bash
cd web
npm install
npm run dev
```

## API 文档

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/register | 用户注册 |
| POST | /api/login | 用户登录 |
| GET | /api/products | 商品列表 |
| GET | /api/products/:id | 商品详情 |
| POST | /api/orders | 创建订单 |
| GET | /api/orders/:order_no | 查询订单 |
| GET | /api/orders/:order_no/pay | 获取支付链接 |
| GET | /api/orders/query | 买家订单查询 |
| POST | /api/payment/callback | 支付回调 |

### 需要认证

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/profile | 个人信息 |
| PUT | /api/profile | 更新信息 |
| GET | /api/merchant/products | 商户商品 |
| POST | /api/merchant/products | 创建商品 |
| PUT | /api/merchant/products/:id | 更新商品 |
| DELETE | /api/merchant/products/:id | 删除商品 |
| POST | /api/merchant/products/:id/cards | 导入卡密 |
| GET | /api/merchant/orders | 商户订单 |

### 管理员

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/users | 用户列表 |
| PUT | /api/admin/users/:id/status | 禁用用户 |

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 部署

### Docker

```bash
docker build -t card-shop .
docker run -p 8080:8080 card-shop
```

### 二进制

```bash
go build -o card-shop cmd/server/main.go
./card-shop
```

## License

MIT
