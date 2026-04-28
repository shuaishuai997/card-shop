# 发卡网系统 - 项目总结

## 项目概述

基于 Go + React 的多商户虚拟卡发卡系统，支持支付宝/微信（易支付）自动发卡。

## 技术栈

**后端:**
- Go 1.21+
- Gin (Web框架)
- GORM (ORM)
- SQLite (可切换MySQL)
- JWT 认证

**前端:**
- React 18 + TypeScript
- Ant Design UI
- Vite 构建工具
- React Router

## 核心功能

1. **多商户系统**
   - 商户注册/登录
   - 店铺管理
   - API密钥管理

2. **商品管理**
   - 商品CRUD
   - 批量导入卡密（CSV格式）
   - 上下架控制

3. **订单系统**
   - 自动创建订单
   - 支付链接生成
   - 支付回调处理
   - 自动发卡

4. **支付对接**
   - 易支付兼容（支付宝/微信）
   - MD5签名验证
   - 支付回调处理

5. **优惠券系统**
   - 折扣券/满减券
   - 使用次数限制

## 项目结构

```
card-shop/
├── cmd/server/main.go          # 程序入口
├── configs/config.yaml         # 配置文件
├── internal/
│   ├── config/                 # 配置加载
│   ├── database/               # 数据库初始化
│   ├── handler/                # HTTP处理器
│   ├── middleware/             # 中间件(JWT/CORS)
│   ├── model/                  # 数据模型
│   ├── repository/             # 数据访问层
│   └── service/                # 业务逻辑层
├── pkg/
│   └── payment/                # 易支付SDK
├── web/                        # React前端
│   ├── src/
│   │   ├── api/                # API接口
│   │   ├── contexts/           # React Context
│   │   ├── pages/              # 页面组件
│   │   └── utils/              # 工具函数
│   └── vite.config.ts
└── README.md
```

## 启动方式

**后端:**
```bash
cd card-shop
go mod tidy
go run cmd/server/main.go
```

**前端:**
```bash
cd card-shop/web
npm install
npm run dev
```

## 默认账号

- 用户名: admin
- 密码: admin123

## 待完善功能

1. 管理员后台（用户管理、系统配置）
2. 邮件发送（订单通知）
3. 数据统计/报表
4. 商品分类管理
5. 支付配置页面
6. 前端买家页面（商品展示、购买流程）

## 部署建议

1. 生产环境切换为MySQL
2. 配置HTTPS
3. 设置正确的JWT密钥
4. 配置易支付网关地址和密钥
5. 使用Docker容器化部署
