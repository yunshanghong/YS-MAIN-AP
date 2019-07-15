# 驗證信箱位址入口

## [POST] /auth/verify-email/:vid

---

### 接口接收

```javascript
{
  params: {
    vid: 'IN_MAIL_VERIFY_ID'
  }
}
```

---

### 回傳錯誤

```javascript
{
  errors: {
    msg: 'ERROR'
  }
}
```

---

### 回傳成功

{}
redirect to /dashboard

---
