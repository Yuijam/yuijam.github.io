---
layout: post
title: Leetcode LinkedList
tags: [Leetcode, LinkedList]
---

#### 206 链表反转 99.25%

```js
function ListNode(val) {
	this.val = val;
	this.next = null;
}

var reverseList = function(head) {
	let pre = null, n = null
	while(head){
		n = head.next
		head.next = pre
		pre = head
		head = n
	}
	return pre
};

let l1 = new ListNode(1)
let l2 = new ListNode(2)
let l3 = new ListNode(3)
let l4 = new ListNode(4)
let l5 = new ListNode(5)
l1.next = l2
l2.next = l3
l3.next = l4
l4.next = l5

let n = reverseList(l1)
while(n){
	console.log(n.val)
	n = n.next
}
```

<!-- more -->

#### 24 两两交换链表中的节点  88.76%

```js
function ListNode(val) {
	this.val = val;
	this.next = null;
}

var swapPairs = function(head) {
	let pre = null, ret = null
	if (head && !head.next) return head

	while (head && head.next){
		let behind = head.next
		if (!ret) {ret = behind;}
		head.next = head.next.next
		behind.next = head
		if (pre){
			pre.next = behind
		}
		pre = head
		head = head.next
	}
	return ret
};

let l1 = new ListNode(1)
let l2 = new ListNode(2)
let l3 = new ListNode(3)
let l4 = new ListNode(4)
let l5 = new ListNode(5)
l1.next = l2
l2.next = l3
l3.next = l4
l4.next = l5

let n = swapPairs(l1)
while(n){
	console.log(n.val)
	n = n.next
}
```

#### 141 环形链表 89.44%

```js
// first 89.44%
var hasCycle = function(head) {
	let s = new Map();
	let idx = 0
	while(head){
		if (!s.has(head)){
			s.set(head, idx++)
		}else{
			return s.get(head)
		}
		head = head.next
	}
	return -1
};
```

上面这个用map能够返回尾部是接在哪个节点上了。但是题目实际上不需要，下面的解法2才是题目需要的，这个就更快了。两者内存基本没有差别。但是速度快了很多。

```js
// 99.19%
var hasCycle = function(head) {
	let s = new Set();
	while(head){
		if (!s.has(head)){
			s.add(head)
		}else{
			return true
		}
		head = head.next
	}
	return false
};
```

上面两个的复杂度都是O(n)，因为要遍历一遍链表。还有一个正常人想不到的办法，叫龟兔赛跑（快慢指针），用两个指针，一个一次走一步，一个一次走两步，那么如果有环，这两个就一定会相遇。

```js
var hasCycle = function(head) {
	let slow = fast = head;
	while(slow && fast && fast.next){
		slow = slow.next
		fast = fast.next.next
		if (slow === fast) return true
	}
	return false
};
```

实际结果是这个显然不如前面那个好，速度82.27%，比之前慢，但是因为少用了一个set，所以空间上省了1M。

