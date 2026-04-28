package handler

import "strconv"

func parseInt(s string) int {
	i, _ := strconv.Atoi(s)
	if i <= 0 {
		return 1
	}
	return i
}
