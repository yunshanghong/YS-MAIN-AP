# 登入入口

## [POST] /api/auth

---

### 接口接收

{
email,
password,
}

---

### 回傳錯誤

{
email: null || "錯誤提示",
password: null,
}

---

### 回傳成功

{
user: user 實體,
access_token: jwt,
}

---
