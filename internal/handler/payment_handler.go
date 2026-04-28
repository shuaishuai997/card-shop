package handler

import (
	"net/http"
	"strconv"

	"card-shop/internal/model"
	"card-shop/internal/repository"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	repo *repository.PaymentConfigRepository
}

func NewPaymentHandler(repo *repository.PaymentConfigRepository) *PaymentHandler {
	return &PaymentHandler{repo: repo}
}

type SavePaymentConfigRequest struct {
	ID         uint   `json:"id"`
	PayType    string `json:"pay_type" binding:"required"`
	GatewayURL string `json:"gateway_url" binding:"required"`
	PID        string `json:"pid" binding:"required"`
	Key        string `json:"key" binding:"required"`
	NotifyURL  string `json:"notify_url"`
	ReturnURL  string `json:"return_url"`
	Status     int    `json:"status"`
}

// List 获取商户的所有支付配置
func (h *PaymentHandler) List(c *gin.Context) {
	merchantID := c.GetUint("user_id")
	configs, err := h.repo.ListByMerchant(merchantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": configs})
}

// Get 获取单个支付配置
func (h *PaymentHandler) Get(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var config model.PaymentConfig
	if err := h.repo.FindByID(uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "未找到"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": config})
}

// Save 新增或更新支付配置
func (h *PaymentHandler) Save(c *gin.Context) {
	merchantID := c.GetUint("user_id")
	var req SavePaymentConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	config := model.PaymentConfig{
		MerchantID: merchantID,
		PayType:    req.PayType,
		GatewayURL: req.GatewayURL,
		PID:        req.PID,
		Key:        req.Key,
		NotifyURL:  req.NotifyURL,
		ReturnURL:  req.ReturnURL,
		Status:     req.Status,
	}

	if req.ID > 0 {
		config.ID = req.ID
		if err := h.repo.Update(&config); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
			return
		}
	} else {
		if err := h.repo.Create(&config); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "保存成功", "data": config})
}

// Delete 删除支付配置
func (h *PaymentHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
