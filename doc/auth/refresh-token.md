# 更新 JWT 入口

## [POST] /auth/refresh-token

---

### 接口接收

```javascript
{
  headers: {
    authorization: `Bearer ACCESS_TOKEN`
  },
  data: {}
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
  access_token: 'NEW_JWT_TOKEN'
}
```

---
