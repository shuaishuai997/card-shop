package model

import (
	"time"

	"gorm.io/gorm"
)

// User 用户表（支持多商户）
type User struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Username    string         `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password    string         `gorm:"size:255;not null" json:"-"`
	Email       string         `gorm:"size:100" json:"email"`
	Phone       string         `gorm:"size:20" json:"phone"`
	Role        string         `gorm:"size:20;default:'merchant'" json:"role"` // admin, merchant, customer
	Status      int            `gorm:"default:1" json:"status"`                // 1:正常 0:禁用
	Balance     float64        `gorm:"default:0" json:"balance"`               // 商户余额
	ShopName    string         `gorm:"size:100" json:"shop_name"`              // 店铺名称
	ShopDomain  string         `gorm:"uniqueIndex;size:50" json:"shop_domain"` // 店铺域名标识
	APIKey      string         `gorm:"size:64" json:"api_key"`                 // API密钥
	Products    []Product      `gorm:"foreignKey:MerchantID" json:"products"`
	Orders      []Order        `gorm:"foreignKey:MerchantID" json:"orders"`
}

// Product 商品表
type Product struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	MerchantID  uint           `gorm:"index;not null" json:"merchant_id"`
	Name        string         `gorm:"size:200;not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Price       float64        `gorm:"not null" json:"price"`
	Stock       int            `gorm:"default:0" json:"stock"`
	SoldCount   int            `gorm:"default:0" json:"sold_count"`
	CategoryID  uint           `gorm:"index" json:"category_id"`
	Image       string         `gorm:"size:255" json:"image"`
	Status      int            `gorm:"default:1" json:"status"` // 1:上架 0:下架
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	Cards       []Card         `gorm:"foreignKey:ProductID" json:"cards"`
	Category    *Category      `gorm:"foreignKey:CategoryID" json:"category"`
}

// Card 卡密表
type Card struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	ProductID uint           `gorm:"index;not null" json:"product_id"`
	CardNo    string         `gorm:"size:255;not null" json:"card_no"`    // 卡号
	CardPwd   string         `gorm:"size:255" json:"card_pwd"`            // 卡密（可选）
	Status    int            `gorm:"default:0" json:"status"`             // 0:未售 1:已售
	OrderNo   string         `gorm:"size:64" json:"order_no"`             // 关联订单号
	SoldAt    *time.Time     `json:"sold_at"`
}

// Order 订单表
type Order struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	OrderNo      string         `gorm:"uniqueIndex;size:64;not null" json:"order_no"`
	MerchantID   uint           `gorm:"index;not null" json:"merchant_id"`
	ProductID    uint           `gorm:"index;not null" json:"product_id"`
	Quantity     int            `gorm:"not null" json:"quantity"`
	TotalAmount  float64        `gorm:"not null" json:"total_amount"`
	PayAmount    float64        `gorm:"not null" json:"pay_amount"`
	PayMethod    string         `gorm:"size:20" json:"pay_method"`      // alipay, wxpay
	PayStatus    int            `gorm:"default:0" json:"pay_status"`    // 0:待支付 1:已支付 2:已退款
	PayTime      *time.Time     `json:"pay_time"`
	TradeNo      string         `gorm:"size:64" json:"trade_no"`        // 第三方支付流水号
	BuyerEmail   string         `gorm:"size:100" json:"buyer_email"`    // 买家邮箱（发卡用）
	BuyerPhone   string         `gorm:"size:20" json:"buyer_phone"`     // 买家手机
	BuyerIP      string         `gorm:"size:45" json:"buyer_ip"`
	Cards        string         `gorm:"type:text" json:"cards"`         // 已发卡密JSON
	CouponID     uint           `json:"coupon_id"`
	DiscountAmount float64      `gorm:"default:0" json:"discount_amount"`
}

// Category 商品分类
type Category struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `gorm:"size:50;not null" json:"name"`
	SortOrder int            `gorm:"default:0" json:"sort_order"`
	Products  []Product      `gorm:"foreignKey:CategoryID" json:"products"`
}

// Coupon 优惠券
type Coupon struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	MerchantID   uint           `gorm:"index;not null" json:"merchant_id"`
	Code         string         `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Type         int            `gorm:"default:1" json:"type"`          // 1:折扣 2:满减
	Discount     float64        `gorm:"default:0" json:"discount"`      // 折扣率或减免金额
	MinAmount    float64        `gorm:"default:0" json:"min_amount"`    // 最低消费金额
	TotalCount   int            `gorm:"default:0" json:"total_count"`   // 总数量
	UsedCount    int            `gorm:"default:0" json:"used_count"`    // 已使用数量
	StartTime    time.Time      `json:"start_time"`
	EndTime      time.Time      `json:"end_time"`
	Status       int            `gorm:"default:1" json:"status"`        // 1:启用 0:禁用
}

// PaymentConfig 支付配置（易支付）
type PaymentConfig struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	MerchantID   uint           `gorm:"index;not null" json:"merchant_id"`
	PayType      string         `gorm:"size:20;not null" json:"pay_type"` // alipay, wxpay
	GatewayURL   string         `gorm:"size:255;not null" json:"gateway_url"`
	PID          string         `gorm:"size:50;not null" json:"pid"`
	Key          string         `gorm:"size:100;not null" json:"key"`
	NotifyURL    string         `gorm:"size:255" json:"notify_url"`
	ReturnURL    string         `gorm:"size:255" json:"return_url"`
	Status       int            `gorm:"default:1" json:"status"`
}

// SystemConfig 系统配置
type SystemConfig struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Key       string    `gorm:"uniqueIndex;size:50;not null" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}
