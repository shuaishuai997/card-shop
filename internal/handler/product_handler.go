package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"card-shop/internal/service"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(service *service.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

// Create 创建商品
func (h *ProductHandler) Create(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req service.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	product, err := h.service.Create(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "创建成功",
		"data":    product,
	})
}

// Update 更新商品
func (h *ProductHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var req service.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := h.service.Update(uint(id), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "更新成功",
	})
}

// Delete 删除商品
func (h *ProductHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "删除成功",
	})
}

// Get 获取商品详情
func (h *ProductHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	product, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "商品不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": product,
	})
}

// List 列出商户的商品
func (h *ProductHandler) List(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	products, total, err := h.service.ListByMerchant(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"list":      products,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// PublicList 公开商品列表
func (h *ProductHandler) PublicList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	products, total, err := h.service.ListPublic(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"list":      products,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// UpdateStatus 更新商品状态
func (h *ProductHandler) UpdateStatus(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var req struct {
		Status int `json:"status" binding:"oneof=0 1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := h.service.UpdateStatus(uint(id), req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "状态更新成功",
	})
}

// ImportCards 导入卡密
func (h *ProductHandler) ImportCards(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var req struct {
		CSVData string `json:"csv_data" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	count, err := h.service.ImportCards(uint(id), req.CSVData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "导入成功",
		"data": gin.H{
			"count": count,
		},
	})
}

// UploadImage 上传商品图片
func (h *ProductHandler) UploadImage(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请选择图片文件"})
		return
	}

	// 限制文件大小 5MB
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "图片大小不能超过5MB"})
		return
	}

	// 保存到 web/public/uploads/
	filename := fmt.Sprintf("product_%d_%d%s", id, time.Now().UnixNano(), filepath.Ext(file.Filename))
	uploadsDir := "../web/public/uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "目录创建失败"})
		return
	}

	savePath := filepath.Join(uploadsDir, filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "文件保存失败"})
		return
	}

	// 更新数据库 image 字段
	url := "/uploads/" + filename
	if err := h.service.UpdateImage(uint(id), url); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "数据库更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "上传成功",
		"data": gin.H{
			"url": url,
		},
	})
}