package main

import (
	"log"

	"card-shop/internal/config"
	"card-shop/internal/database"
	"card-shop/internal/handler"
	"card-shop/internal/middleware"
	"card-shop/internal/repository"
	"card-shop/internal/service"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	if err := config.Init("./configs/config.yaml"); err != nil {
		log.Fatalf("配置加载失败: %v", err)
	}

	// 初始化数据库
	if err := database.Init(config.GlobalConfig); err != nil {
		log.Fatalf("数据库初始化失败: %v", err)
	}

	// 初始化依赖
	db := database.DB

	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	cardRepo := repository.NewCardRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	paymentRepo := repository.NewPaymentConfigRepository(db)

	userService := service.NewUserService(userRepo)
	productService := service.NewProductService(productRepo, cardRepo)
	orderService := service.NewOrderService(orderRepo, productRepo, cardRepo, db)

	userHandler := handler.NewUserHandler(userService)
	productHandler := handler.NewProductHandler(productService)
	orderHandler := handler.NewOrderHandler(orderService, productRepo, paymentRepo)

	paymentHandler := handler.NewPaymentHandler(paymentRepo)

	// 初始化路由
	r := gin.Default()
	r.Use(middleware.CORS())

	// 静态文件服务（商品图片等）
	r.Static("/uploads", "../web/public/uploads")

	// 公开路由
	api := r.Group("/api")
	{
		// 用户认证
		api.POST("/register", userHandler.Register)
		api.POST("/login", userHandler.Login)

		// 公开商品列表
		api.GET("/products", productHandler.PublicList)
		api.GET("/products/:id", productHandler.Get)

		// 订单
		api.POST("/orders", orderHandler.Create)
		api.GET("/orders/:order_no", orderHandler.GetByOrderNo)
		api.GET("/orders/:order_no/pay", orderHandler.GetPayURL)
		api.GET("/orders/query", orderHandler.QueryByBuyer)

		// 支付回调
		api.POST("/payment/callback", orderHandler.Callback)
	}

	// 需要认证的路由
	auth := api.Group("")
	auth.Use(middleware.AuthMiddleware())
	{
		// 用户信息
		auth.GET("/profile", userHandler.GetProfile)
		auth.PUT("/profile", userHandler.UpdateProfile)
		auth.PUT("/password", userHandler.ChangePassword)
		auth.POST("/api-key", userHandler.RegenerateAPIKey)

		// 商户商品管理
		auth.GET("/products/merchant", productHandler.List)
		auth.POST("/products/merchant", productHandler.Create)
		auth.PUT("/products/:id", productHandler.Update)
		auth.DELETE("/products/:id", productHandler.Delete)
		auth.PUT("/products/:id/status", productHandler.UpdateStatus)
		auth.POST("/products/:id/cards", productHandler.ImportCards)
		auth.POST("/products/:id/image", productHandler.UploadImage)

		// 商户订单管理
		auth.GET("/orders", orderHandler.List)
		auth.GET("/merchant/orders", orderHandler.List)
		auth.GET("/merchant/orders/:id", orderHandler.Get)

		// 支付配置管理
		auth.GET("/payment-configs", paymentHandler.List)
		auth.GET("/payment-configs/:id", paymentHandler.Get)
		auth.POST("/payment-configs", paymentHandler.Save)
		auth.PUT("/payment-configs/:id", paymentHandler.Save)
		auth.DELETE("/payment-configs/:id", paymentHandler.Delete)
	}

	// 管理员路由
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.GET("/users", userHandler.ListUsers)
		admin.PUT("/users/:id/status", userHandler.UpdateUserStatus)
	}

	// 启动服务
	log.Printf("服务器启动在 :%d", config.GlobalConfig.Server.Port)
	if err := r.Run(); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
