# 忘記密碼入口

## [POST] /auth/forgot

---

### 接口接收

```javascript
{
  email: 'NEED_RESET_EMAIL'
}
```

---

### 回傳錯誤

```javascript
{
  errors: {
    msg: [err]
  }
}
```

---

### 回傳成功

```javascript
{
  msg: 'RESET_EMAIL_SENT',
  email: 'NEED_RESET_EMAIL'
}
```

With Reset link email

---
