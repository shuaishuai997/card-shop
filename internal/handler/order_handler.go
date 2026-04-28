package handler

import (
	"net/http"
	"strconv"

	"card-shop/internal/repository"
	"card-shop/internal/service"
	"card-shop/pkg/payment"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	service       *service.OrderService
	productRepo   *repository.ProductRepository
	paymentRepo   *repository.PaymentConfigRepository
}

func NewOrderHandler(service *service.OrderService, productRepo *repository.ProductRepository, paymentRepo *repository.PaymentConfigRepository) *OrderHandler {
	return &OrderHandler{service: service, productRepo: productRepo, paymentRepo: paymentRepo}
}

// Create 创建订单
func (h *OrderHandler) Create(c *gin.Context) {
	var req service.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	// 获取商品信息
	product, err := h.productRepo.FindByID(req.ProductID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "商品不存在"})
		return
	}

	order, err := h.service.Create(product.MerchantID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"message": "订单创建成功",
		"data": order,
	})
}

// GetPayURL 获取支付链接
func (h *OrderHandler) GetPayURL(c *gin.Context) {
	orderNo := c.Param("order_no")
	payType := c.Query("type") // alipay or wxpay

	order, err := h.service.GetByOrderNo(orderNo)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	if order.PayStatus == 1 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "订单已支付"})
		return
	}

	// 获取支付配置
	config, err := h.paymentRepo.FindByMerchantAndType(order.MerchantID, payType)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "支付方式未配置"})
		return
	}

	// 生成支付链接
	client := payment.NewEpayClient(config.GatewayURL, config.PID, config.Key, config.NotifyURL, config.ReturnURL)
	payURL := client.CreatePayment(order.OrderNo, order.PayAmount, payType)

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"pay_url": payURL,
		},
	})
}

// Callback 支付回调
func (h *OrderHandler) Callback(c *gin.Context) {
	// 获取回调参数
	params := make(map[string]string)
	c.Request.ParseForm()
	for k, v := range c.Request.Form {
		if len(v) > 0 {
			params[k] = v[0]
		}
	}

	orderNo := params["out_trade_no"]
	tradeNo := params["trade_no"]
	payType := params["type"]

	order, err := h.service.GetByOrderNo(orderNo)
	if err != nil {
		c.String(http.StatusBadRequest, "fail")
		return
	}

	// 获取支付配置并验证签名
	config, err := h.paymentRepo.FindByMerchantAndType(order.MerchantID, payType)
	if err != nil {
		c.String(http.StatusBadRequest, "fail")
		return
	}

	client := payment.NewEpayClient(config.GatewayURL, config.PID, config.Key, "", "")
	if !client.VerifyCallback(params) {
		c.String(http.StatusBadRequest, "fail")
		return
	}

	// 处理支付成功
	if err := h.service.PaymentCallback(orderNo, tradeNo, payType); err != nil {
		c.String(http.StatusBadRequest, "fail")
		return
	}

	c.String(http.StatusOK, "success")
}

// Get 查询订单
func (h *OrderHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	order, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": order,
	})
}

// GetByOrderNo 按订单号查询
func (h *OrderHandler) GetByOrderNo(c *gin.Context) {
	orderNo := c.Param("order_no")

	order, err := h.service.GetByOrderNo(orderNo)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": order,
	})
}

// List 列出商户订单
func (h *OrderHandler) List(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var payStatus *int
	if s := c.Query("pay_status"); s != "" {
		status, _ := strconv.Atoi(s)
		payStatus = &status
	}

	orders, total, err := h.service.ListByMerchant(userID, page, pageSize, payStatus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"list":      orders,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// QueryByBuyer 买家查询订单
func (h *OrderHandler) QueryByBuyer(c *gin.Context) {
	email := c.Query("email")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请输入邮箱"})
		return
	}

	orders, total, err := h.service.ListByBuyer(email, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"list":      orders,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}
