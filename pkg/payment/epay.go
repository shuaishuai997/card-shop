package payment

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"net/url"
	"sort"
	"strings"
)

// EpayClient 易支付客户端
type EpayClient struct {
	GatewayURL string
	PID        string
	Key        string
	NotifyURL  string
	ReturnURL  string
}

func NewEpayClient(gatewayURL, pid, key, notifyURL, returnURL string) *EpayClient {
	return &EpayClient{
		GatewayURL: gatewayURL,
		PID:        pid,
		Key:        key,
		NotifyURL:  notifyURL,
		ReturnURL: returnURL,
	}
}

// CreatePayment 创建支付
func (c *EpayClient) CreatePayment(orderNo string, amount float64, payType string) string {
	params := map[string]string{
		"pid":          c.PID,
		"type":         payType,
		"out_trade_no": orderNo,
		"notify_url":   c.NotifyURL,
		"return_url":   c.ReturnURL,
		"name":         "订单-" + orderNo,
		"money":        fmt.Sprintf("%.2f", amount),
	}

	// 生成签名
	sign := c.generateSign(params)
	params["sign"] = sign
	params["sign_type"] = "MD5"

	// 构建URL
	values := url.Values{}
	for k, v := range params {
		values.Set(k, v)
	}

	return c.GatewayURL + "/submit.php?" + values.Encode()
}

// VerifyCallback 验证回调签名
func (c *EpayClient) VerifyCallback(params map[string]string) bool {
	sign, ok := params["sign"]
	if !ok {
		return false
	}

	delete(params, "sign")
	delete(params, "sign_type")

	expectedSign := c.generateSign(params)
	return sign == expectedSign
}

// generateSign 生成签名
func (c *EpayClient) generateSign(params map[string]string) string {
	// 按键名排序
	keys := make([]string, 0, len(params))
	for k := range params {
		if params[k] != "" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	// 拼接字符串
	var parts []string
	for _, k := range keys {
		parts = append(parts, k+"="+params[k])
	}
	signStr := strings.Join(parts, "&") + c.Key

	// MD5
	hash := md5.Sum([]byte(signStr))
	return hex.EncodeToString(hash[:])
}
