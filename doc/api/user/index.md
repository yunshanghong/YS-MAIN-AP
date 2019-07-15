# JWT 登入入口

## [POST] /users?filter=ad&fields=name,email&page=1&limit=10&sort=name&order=-1

---

### 接口接收

```javascript
{
  headers: {
    authorization: `Bearer ACCESS_TOKEN`
  },
  params: {
    // filter 與 fields 必須同時寫入才會篩選
    filter: '',
    fields: '',
    // 回傳第幾頁的資料
    page: 1,
    // 回傳資料大小
    limit: 20,
    // 要排序的欄位
    sort: '',
    // 1 or -1
    order: 1,
  }
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
  "docs": [
    "USER_DATA_ARRAY"
  ],
  "totalDocs": 2,
  "limit": 2,
  "hasPrevPage": false,
  "hasNextPage": false,
  "page": 1,
  "totalPages": 1,
  "pagingCounter": 1,
  "prevPage": null,
  "nextPage": null
}
```

---
