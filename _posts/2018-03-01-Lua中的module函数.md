---
layout: post
title: Lua中的module函数
tags: [Lua]
---

#### 模块的基本编写方法

```lua
local M = {}
local modname = 'a'
_G[modname] = M
package.loaded[modname] = M

function M.play()
    print('play')
end

function M.say()
    print('say')
    M.play()
end

return M
```

 这里的问题是模块内函数之间的调用仍然要保留模块名的限定符，比如say中调用play方法就需要M.play。 

<!-- more -->

#### 使用环境

解决上面那个问题可以用setfenv把当前模块的全局环境设置为M，于是，定义函数的时候就不用加上M，模块中函数间的调用也不需要加M限定。 

```lua
local M = {}
local modname = 'a'
_G[modname] = M
package.loaded[modname] = M
setfenv(1, M)

function play()
    -- print('play')
end

function say()
    -- print('say')
    play()
end

return M
```

上面把print注释掉了，是因为这个时候调用play或者say方法会报错，大概是说没有print这个东西。因为当前的全局环境变了，不是_G而是M，M中当然没有print。那要如何使用到_G中的全局变量呢？元表。 

```lua
local M = {}
local modname = 'a'
_G[modname] = M
package.loaded[modname] = M

setmetatable(M, {__index = _G})
setfenv(1, M)
```

#### 使用module

可以使用module函数来替换下面的代码 

```lua
local M = {}
local modname = 'a'
_G[modname] = M
package.loaded[modname] = M

setfenv(1, M)
```

上面的可以简化为

```lua
module('a')
```

module默认是不提供外部访问的，也就是说这个时候print这些还是不能用的。

如果要加上`setmetatable(M, {__index = _G})`的效果，需要加上`package.seeall`参数，如

```lua
module('a', package.seeall)
```

稍微一个总结：使用module来创建模块，定义函数以及模块内函数间的调用都可以不用加上限定附，比如上面的M。还有就是可以不用写return M，以及可以访问到_G中的全局变量。

附：

setfenv(f, table)：设置一个函数的环境

　　（1）当第一个参数为一个函数时，表示设置该函数的环境

　　（2）当第一个参数为一个数字时，为1代表当前函数，2代表调用自己的函数，3代表调用自己的函数的函数，以此类推

　　所谓函数的环境，其实一个环境就是一个表，该函数被限定为只能访问该表中的域，或在函数体内自己定义的变量。