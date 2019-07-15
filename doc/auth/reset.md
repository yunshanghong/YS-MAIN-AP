# 密碼重設入口

## [POST] /auth/reset

---

### 接口接收

{
id,
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
msg: 'PASSWORD_CHANGED'
}

---
