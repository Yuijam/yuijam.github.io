---
layout: post
title: Greedy-algorithm
tags: [leetcode]
---

大概意思就是局部最优导致全局最优。这种做法现实中比较少，因为毕竟还是要从全局来考虑问题。

**122. 买卖股票的最佳时机 II**

```js
// 52 ms  99.52% 35.9 MB 9.98%
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
  let buy = -1
  let total = 0
  for (let i = 0; i < prices.length; i++) {
    if (buy < 0) {
      if (prices[i+1] !== undefined && prices[i+1] > prices[i]) {
        buy = i
      }
    } else {
      if (prices[i+1] !== undefined) {
        if (prices[i+1] < prices[i]) {
          total = (prices[i] - prices[buy]) + total
          buy = -1
        }
      } else {
        total = prices[i] - prices[buy] + total
      }
    }
  }
  return total
};

console.log(maxProfit([7,1,5,3,6,4]))
console.log(maxProfit([1,2,3,4,5,9]))
console.log(maxProfit([7,6,4,3,1]))
console.log(maxProfit([2,1,2,0,1]))
```

这个题只要看到后一天比前一天价高就在前一天买进即可，我这里是找到接下来几天的峰值后才算收益，实际上，可以不用这样做，只要今天比昨天高就卖出好了。

