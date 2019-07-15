# JWT 登入入口

## [POST] /auth/access-token

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
  user: user 實體,
  access_token: jwt,
}
```

---
