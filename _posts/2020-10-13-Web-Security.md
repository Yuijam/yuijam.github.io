---
layout: post
title: Web Security
tags: [web, security]
---
#### XSS 
js代码通过script标签被注入到html页面，可以通过转义来解决
通过a标签：`<a href="javascript:alert(&#x27;XSS&#x27;)">come on</a>` 点击后href里面的js代码会被执行

更坑爹的是javascript:会被执行，jAvascript这种也会被执行，也就是说javascript:这个东西不管大小写还是前后有空格啥的，都会被执行

最终的解决办法是面对href这种值，只能允许http或者https，来杜绝javascript:这种东西被注入

json字符串中不能含有</script>，否则前面的script标签会被关闭掉

React/Vue时，不使用v-html/dangerouslySetInnerHTML，像href这种能通过javascirpt:来执行代码的标签，要特别注意字符串拼接的问题

使用http-only：通常来说document.cookie能拿到当前网站的，但是如果给cookie加上http-only，前端js就拿不到cookie了。要删除的时候，可以通过类似下面代码删除
```js
res.clearCookie('sid', {
    path: '/',
    httpOnly: true,
    secure: false,
  });
```
来源：https://juejin.im/post/6844903685122703367

