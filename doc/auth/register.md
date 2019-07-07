# 註冊入口

## [POST] /api/auth/register

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

```
uuid    : DB._id,
from    : 'custom-db',
role    : "admin",
data    : {
    displayName: displayName,
    photoURL   : 'assets/images/avatars/Abbott.jpg',
    email      : email,
    settings   : {},
    shortcuts  : []
}
```
