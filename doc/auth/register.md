# 註冊入口

## [POST] /auth/register

---

### 接口接收

{
displayName,
email,
password,
}

---

### 回傳錯誤

{
displayName: null || "錯誤提示",
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

user 實體

```javascript
{
    uuid: req._id,
    from: 'm-lab-db',
    role: req.role,
    data: {
      displayName: req.displayName,
      photoURL: req.photoURL,
      email: req.email,
      settings: {
        layout: {
          style: 'layout1',
          config: {
            navbar: {
              folded: true
            },
            footer: {
              style: 'static'
            }
          }
        },
        customScrollbars: true,
        theme: {
          main: 'defaultDark',
          navbar: 'mainThemeDark',
          toolbar: 'mainThemeDark',
          footer: 'mainThemeDark'
        }
      },
      shortcuts: req.shortcuts
    },
    verified: req.verified
}
```
