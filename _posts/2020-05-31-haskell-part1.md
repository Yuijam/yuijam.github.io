---
layout: post
title: haskell-part1
tags: [haskell]
---

函数调用函数的时候，定义谁前谁后都无所谓。

if语句的else部分是不可省略，if语句的另一个特点就是它其实是个**表达式**，表达式就是返回一个值的一段代码。

```haskell
biggerNum x = (if (x > 10) then x+x else x) + 1
```

单引号是合法的函数名字符，使用单引号来区分一个稍经修改但差别不大的函数。

如果表示一个字符要用单引号，字符串用双引号。比如

```haskell
str = "abcd"
"e" `elem` str
```

会报错，如果e用单引号就没有问题，看报错信息，应该是如果用双引号的话就会被转成数组，而单引号就是char了

<!-- more -->

### List comprehension

从一个集合生成另一个集合。比如

```
{x²  |  x ∈ {1...5}}
```

x是一个1到5的集合，然后从这个结合每个元素平方，得到另一个集合。代码上的写法形式上跟这个也类似，然后逗号隔开就能添加另外的条件，继续筛选数据

```haskell
[x | x <- [1..10], even x]
```

竖线右边是声明左边的变量x是属于哪个集合。因此，如果写成函数形式的话，如果要根据参数来生成新的数据，就可以写成下面这样

```haskell
boomBangs xs = [ if (x>10) then "BOOM!" else "BANG!" | x <- xs, odd x]  
```

多个变量

```haskell
[ x*y | x<-[2,5,10], y<-[8,10,11], x*y > 50]
```

comprehension的这种感觉有点像map的意思，对集合中的每个元素都执行同样的操作返回一个新的集合，同样如果是两个集合的话就跟两个嵌套的map效果是一样的。然后逗号后面添加条件进行过滤。返回true的留下。

果然后面讲到map的时候就说这两者代码可以替换。:happy:如果要连着用map和filter的话就还是List comprehension好用一些，一条语句就能写完，看着比较爽。

###  tuple

 与list不同的是他能放不同类型的元素。如果list里面放tuple，那么由于list里面元素类型要保持一致，因此每个tuple的每个位置上的元素类型都要保持一致。

 ### type

haskell有一个静态类型系统，每个表达式的类型在编译器都是知道的，如果你试图用boolean类型和一个数字做除法，他甚至都不会编译，在hs中，所有的东西都一个类型，这得以让编译器在编译前进行打量的推断。

类型是每个表达式的一种标签，告诉我们这个表达式是什么类型的。

凡是类型，一定是大写开头的，像Bool，Int，String等等

`::`读作`它的类型为`

### Type variables

上面提到类型一定是大写开头的，所以下面代码中的a不是类型，而是类型变量，意味着a可以为任何类型，和其他语言的泛型概念很像，但是hs的更加强大，因为在不使用类型中的任何方法的时候，能让我们写出通用性非常强的函数。有类型变量的函数被称作**多态函数**

```haskell
Prelude> :t head
head :: [a] -> a
```

### Typeclasses 101

类型类是一种定义了某些行为的接口，如果一个类型是某个类型类的一部分，那就以为着他支持并且实现了该类型类描述的行为。类比与java中的接口。

这里的a是类型，但是不是上面提到的那些Bool啥的类型，像泛型一样表示某种类型。

```haskell
ghci> :t (==)   
(==) :: (Eq a) => a -> a -> Bool
```

`=>`叫做类型约束，上面这一条可以这么描述：==这个函数他接收两个类型为a的参数，然后返回一个Bool，而a是在Eq类（可以比较相等性）中的。大概就是声明a是实现了Eq这个接口的一种类型，他是啥类型不重要，只要他可以比较相等性那就可以放到这里。

### 函数语法

#### 模式匹配

 ```haskell
say :: (Integral a) => a -> String
say 1 = "one"
say 2 = "two"
say x = "not one or two"
 ```

模式会从上至下进行检查，一旦有匹配，那对应的函数体就被应用了。 可以用if else写，但是这样显得更加简洁。最后一行类似default的代码是需要的，不然万一调用了没有匹配的模式就会报错。下面递归写法求数组长度：

```haskell
length' :: (Num b) => [a] -> b
length' [] = 0
length' (_: xs) = 1 + length' xs
```

最后一句的写法要注意，按照他的意思，这里应该是用`(_: xs)`这种形式来从传入的参数中取出值，然后进行递归。类似现在js`({name}) => 'use name do something'`这种形式。

模式匹配类似与switch .. case ，而haskell也提供了真正的case语句，case...of的形式：

```haskell
describeList :: [a] -> String describeList xs = "list is " ++ case xs of [] -> "empty."                                                  [x] -> "a singleton list."                                                   				xs -> "a longer list."  
```

模式匹配只是case的语法糖，case可以用在这种表达式中，但是模式匹配只能用在函数定义时。

**as模式**：给模式命名，然后可以通过这个名字来复用这个模式。

```haskell
capital :: String -> String   
capital "" = "Empty string, whoops!"   
capital all@(x:xs) = "The first letter of " ++ all ++ " is " ++ [x]  
```

#### 门卫（guard）

```haskell
bmiTell :: (RealFloat a) => a -> a -> String   
bmiTell weight height   
    | weight / height ^ 2 <= 18.5 = "You're underweight, you emo, you!"   
    | weight / height ^ 2 <= 25.0 = "You're supposedly normal. Pffft, I bet you're ugly!"   
    | weight / height ^ 2 <= 30.0 = "You're fat! Lose some weight, fatty!"   
    | otherwise                   = "You're a whale, congratulations!" 
```

像if else，特征就是有这种竖线。**与上面不同的是，函数名后面没有等于号**

#### where

上面的代码有重复代码，用`where`把他提取出来

```haskell
bmiTell :: (RealFloat a) => a -> a -> String   
bmiTell weight height   
    | bmi <= 18.5 = "You're underweight, you emo, you!"   
    | bmi <= 25.0 = "You're supposedly normal. Pffft, I bet you're ugly!"   
    | bmi <= 30.0 = "You're fat! Lose some weight, fatty!"   
    | otherwise   = "You're a whale, congratulations!"   
    where bmi = weight / height ^ 2
```

 where关键字跟在门卫后面，里面定义的变量的作用域只在函数内。

在where中用模式匹配。

```haskell
initials :: String -> String -> String   
initials firstname lastname = [f] ++ ". " ++ [l] ++ "."   
    where (f:_) = firstname   
          (l:_) = lastname  
```

教程管这个也叫模式匹配，我其实对这个名字有点糊涂，刚不说了模式匹配是**为不同的模式分别定义函数体** 麽，类似switch .. case麽？这里代码显然没有这个意思啊不是，这就是相当于等号右边的值进行一个拆解重组之类的。而上面的length'函数中这种值的提取和重组操作又是对于传入的参数的，而不是对于等号右边部分，写法上有区别。反正先这么记着这两种形式吧。

#### let

格式：` let [bindings] in [expressions] ` 在*let*中绑定的名字仅对in部分可见。 where定义的变量，只给他上面的部分用，let则只给in部分用。还有一个区别就是像if一样let是一个表达式，**可以到处放**。

```haskell
ghci> [let square x = x * x in (square 5, square 3, square 2)]   
[(25,9,4)] 
```

 let绑定放到List Comprehension中

```haskell
calcBmis :: (RealFloat a) => [(a, a)] -> [a]   
calcBmis xs = [bmi | (w, h) <- xs, let bmi = w / h ^ 2]
```

加入let后这句代码的执行顺序又跟前面不一样了。前面刚说到List Comprehension的时候，执行顺序先竖线|右边，申明变量所属的集合，然后竖线左边开始开始用这些变量进行操作，操作完后交给逗号后面的部分来进行过滤。而加入了let后就变成了声明了变量范围后，开始执行let部分，然后才是竖线左边部分，然后如果let后还有其他语句的话，就继续执行这一部分（过滤）。如果上面的let后面跟了in语句的话，则作用域只在in中。

#### lambda

用\开头，如果右边还有其他内容，就用括号括起来，不然整个右边都是lambda函数的。

```haskell
zipWith (\a b -> (a * 30 + 3) / b) [5,4,3,2,1] [1,2,3,4,5]
```

#### fold

这大概就是haskell的reduce了。不同的是fold分了左折叠和右折叠。左折叠foldl遍历数组时候从左边开始，右折叠foldr则从右边开始。叠加函数的参数位置也是反的。

左右折叠都可以实现map，由于要使得映射的结果跟原始值的位置保持一致。foldl就得用`++`来累加新的数组，而`++`往数组后累加元素的效率比用`:`从前面累加来的低，所以要累加成新的数组的时候，一般用foldr。

```haskell
map' f xs = foldr (\x acc -> f x : acc) [] xs
map' f xs = foldl (\acc x -> acc ++ [f x]) [] xs
```

还有一个区别是处理无限长度的函数的时候，从中间切断向左边累加是可以的，而反之往右边累加是不行的，因为无有尽时。

**foldll**，**foldrl**，这两个跟foldl和foldr一样用，只是他们默认数组的第一个（最后一个）来初始值。因此他们的问题是无法处理空数组，会报错。

#### $

**右结合**的函数调用，正常的函数调用是`f x`这种用空格的左结合调用形式，这种形式也是函数调用的最高优先级，而`$`则是最低优先级，用他的好处是可以减少括号。

```haskell
sum (filter (> 10) (map (*2) [2..10])
sum $ filter (> 10) $ map (*2) [2..10]
```

#### 函数组合

```haskell
map (\x -> negate (abs x)) [5,-3,-6,7,-3,2,-19,24]
map (negate . abs) [5,-3,-6,7,-3,2,-19,24]
```

用点符号连接两个函数，好处大概也是减少括号？:smirk:

### 构造自己的类型和类型类

Bool类型的定义：`data Bool = False | True`，等号右边的就叫做**值构造子**（*Value Constructor*）  它们明确了该类型可能的值。 `|` 读作or。

 构造一个表示图形的类型：

`data Shape = Circle Float Float Float | Rectangle Float Float Float Float`，**值构造子的本质是个函数，可以返回一个类型的值**。用`:t`可以查看这个构造子的类型。

比如上面的输入了上面的代码后，再输入`:t Cicle`可以得到`Circle :: Float -> Float -> Float -> Shape`，因此构造子就是一个函数实锤了。

写一个计算面积的函数：

```haskell
data Shape = Circle Float Float Float | Rectangle Float Float Float Float
surface :: Shape -> Float   
surface (Circle _ _ r) = pi * r ^ 2   
surface (Rectangle x1 y1 x2 y2) = (abs $ x2 - x1) * (abs $ y2 - y1)
a = surface $ Circle 1 1 9
b = surface $ Rectangle 1 1 6 6
```

有几个地方要注意：

- 该函数是输入一个shape然后输出一个float，不能用`Circle -> Float`来声明类型，就像不能用`True -> Int`来声明一样。
- 可以对构造子进行模式匹配

如果直接输入`Circle 1 1 1`，会报错，因为这个时候hs会首先去调用show函数来得到一个要显示的字符串。在后面加上`deriving (Show)`即可。

`data Shape = Circle Float Float Float | Rectangle Float Float Float Float deriving (Show)`

既然值构造子是函数，那么理所当然就可以把他丢到map里，可以部分调用等等。

```haskell
 map (Circle 1 1) [1..3]  -- 得到一组同心圆
 -- [Circle 1.0 1.0 1.0,Circle 1.0 1.0 2.0,Circle 1.0 1.0 3.0]
```

继续改进Shape类型……

```haskell
data Point = Point Float Float deriving (show)
data Shape = Circle Point Float | Rectangle Point Point deriving (show)
```

第一行的数据类型和构造子的名字是一样，这无所谓。现在Circle参数变少了，因此surface也需要调整

```haskell
surface :: Shape -> Float
surface (Circle _ r) = pi * r ^ 2
surface (Rectangle (Point x1 y1) (Point x2 y2)) = (abs $ x2 - x1) * (abs $ y2
- y1)
```

Circle模式中只是减少了一个参数就可以了，而Rectangle模式中，使用嵌套的模式匹配。

这些类型和函数也可以当作模块导出。如下：

### 模块

建一个文件Shapes.hs

```haskell
module Shapes
( Point(..)
, Shape(..)
, surface
) where
  
data Point = Point Float Float
data Shape = Circle Point Float | Rectangle Point Point

surface :: Shape -> Float
surface (Circle _ r) = pi * r ^ 2
surface (Rectangle (Point x1 y1) (Point x2 y2)) = (abs $ x2 - x1) * (abs $ y2 - y1)
```

再在**同个目录**下随便建个文件

```haskell
import Shapes

s = surface $ Circle (Point 1 1) 4
```

### Record Syntax

由上面的内容可以创建自己的类型，第一个参数表示名字，第二个表示年龄，这样虽然也能行，但是可读性很差，别人根本不知道哪个是哪个。

```haskell
data Person = Person String Int deriving (Show)
guy = Person "kobe" 10
```

要得到属性值可以这样写，创建一些对应的函数，要取哪个属性就调用对应函数，比如`name guy`得到name属性。这样固然可行，但是如果属性很多的时候就显得很没意义了

```haskell
name :: Person -> String
name (Person name _ ) = name
age :: Person -> Int
age (Person _ age ) = age
```

因此hs提供了一个叫 record syntax的方式来创建类型

```haskell
data Person = Person { name :: String, age :: Int } deriving (Show)
p = Player "Tracy" 20
pp = Player {age = 11, name = "Tim"}
```

p和pp这两种创建方式都可行，hs会自动创建上面获取属性的那些函数，因此可以直接用`name p`这样的方式来得到p的name值。不信的话，可以`:t name`来得到name函数的签名。

使用 record syntax的方式来创建类型还有一个好处就是`deriving (Show)`后打印出来的数据是带属性的，不像以前那种得一个个对着签名的参数顺序来比对哪个是哪个。

`Player "Tracy" 20`

`Player {name = "Tracy", age = 20}`

### Type parameters

用data定义数据类型的时候，不定死属性的类型，等到实际传入的时候再自动推断。（感觉又有点像泛型？）

```haskell
data Person a b = Person { name :: a, age :: b} deriving (Show)
p = Person { name = "kobe", age = 20 }
p1 = Person { name = False, age = 20 }
```

规则是在用data定义的时候不加类型限制，像（Num a)这样的东西，而是在定义相关函数的时候再限制类型。

### Derived instances

java这种语言的class都是可以用来创建包含状态和行为的对象。而typeclass更像是接口，确保对应的实例具有某种行为。给一种类型加上这种行为，只要加上deriving 。

```haskell
data Person = Person {
  name:: String,
  age:: Int
} deriving (Eq)

p = Person {name= "kobe", age= 20}
pp = Person {name= "kobe", age= 20}
ppp = Person {name= "kobe", age= 21}

p == pp -- True
p == ppp  -- False
```

derive了Eq后，就可以使用那些用签名是Eq a的函数了，比如elem。（真的很像接口）

```haskell
a = [p, pp, ppp]
p `elem` a   -- True
```

再添加Show和Read，Read就是Show的逆过程。

```haskell
data Person a b = Person { name :: a, age :: b} deriving (Eq, Show, Read)
mike = Person {name = "Michael", age = 43}
mikeis = "mikeD is: " ++ show mike 
-- 定义Person的时候没有限制类型，所以这里需要加上String Int的限制，定义的时候写死了属性类型则不用加
mike1 = read $ show mike :: Person String Int  
```

这样Person类就可以比较相等，显示成字符串和从字符串转换成类型的值。

派生了Ord之后，类型就可以进行比较了，比较类型中的各个属性，属性类型为Bool类型的怎么比较呢？规则是看定义，Bool的定义类似这样：`data Bool = False | True deriving (Ord)`，False写在True前面，所以False是比True小的。写在前面的这个永远都比写在后面的要小，无论后面这个值有多小。

```haskell
True `compare` False  -- GT
data Mybool = MyTrue | MyFalse deriving (Eq, Ord)  -- 这里光写Ord是不行的，必须得有Eq，能比较大小，他们得首先能比较相等，大概是这么个意思吧
MyTrue `compare` MyFalse  -- LT
```

### Type synonyms

用关键字`type`给类型取别名，通过特定的别名传递更多的信息，增加代码可读性。

```haskell
phoneBook :: [(String, String)]
phoneBook = [("tracy", "123231"), ("kobe", "433434")]
```

利用类型别名，可读性一下就上来了。如下：

```haskell
type Name = String
type PhoneNumber = String
type PhoneBook = [(Name, PhoneNumber)]
pb :: PhoneBook
pb = [("tracy", "123231"), ("kobe", "433434")]
```



### Recursive data structures

大概就是说如何构造元素类型相同的数据，[5]其实是5:[]的语法糖（冒号表示的是把左边的这元素丢到右边的数组前面），同理，[4,5]其实就是4:5:[]。

现在来实现二叉搜索树

```haskell
-- 构造类型Tree，Tree有可能是空树，否则就是一个根节点加上左右两棵树
-- 再次强调构造子本质上就是函数，因此这里的Node是一个构造子也同样是函数
-- 表示构造Node这个值（这样说虽然好像有点奇怪）需要一个节点加两棵树
data Tree a = EmptyTree | Node a (Tree a) (Tree a) deriving (Show, Read, Eq)

singleton :: a -> Tree a
singleton x = Node x EmptyTree EmptyTree
-- 注意这里遵循了那个原则，即在上面定义Tree类型的时候不限定参数类型，而是给一个a
-- 等到这里真正要写使用到这个类型的函数的时候，这限定类型Ord a,即这个类型得能比大小
treeInsert :: (Ord a) => a -> Tree a -> Tree a
treeInsert x EmptyTree = singleton x  -- 如果是插入到一颗空树就直接拿这个值创建一棵树好了
treeInsert x (Node a left right)  -- 插入非空树的时候，就开始做一些比较
  | x == a = Node x left right
  | x < a = Node a (treeInsert x left) right
  | x > a = Node a left (treeInsert x right)

treeElem :: (Ord a) => a -> Tree a -> Bool
treeElem x EmptyTree = False
treeElem x (Node a left right)
  | x == a = True
  | x < a = treeElem x left
  | x > a = treeElem x right
```

```
ghci> let nums = [8,6,4,1,7,3,5]
ghci> let numsTree = foldr treeInsert EmptyTree nums
ghci> numsTree
Node 5 (Node 3 (Node 1 EmptyTree EmptyTree) (Node 4 EmptyTree EmptyTree)) (Node 7 (Node 6 EmptyTree EmptyTree) (Node 8 EmptyTree EmptyTree))

ghci> 8 ‘treeElem ‘ numsTree
True
ghci> 100 ‘treeElem ‘ numsTree
False
```

### Typeclasses 102

这节是关于如何创建自己的typeclass。再回顾一次：typeclass像是接口，定义了一些行为。实际上就是通过定义函数或者类型声明来实现的。

```handlebars
class Eq a where
  (==) :: a -> a -> Bool
  (/=) :: a -> a -> Bool
  x == y = not (x /= y)
  x /= y = not (x == y)
```

Eq的实现大概长这样子。`class Eq a where`表示定义了一个新的typeclass名叫Eq，a表示任何一个Eq的实例，这个a不一定只能是一个字母，但是必须得是小写的。然后定义一些函数，不强制要求实现函数体，但是必须得明确函数的类型声明。

这里的a如果写成equatable会更好理解，然后下面的函数声明写成：` (==) :: equatable -> equatable -> Bool `，这样确实就看着更加清晰了。那么现在有了一个class Eq，如何创建Eq的实例呢？

```haskell
data TrafficLight = Red | Yellow | Green
instance Eq TrafficLight where
  Red == Red = True
  Yellow == Yellow = True
  Green == Green = True
  _ == _ = False

instance Show TrafficLight where
  show Red = "Red Light"
  show Yellow = "Yellow Light"
  show Green = "Green Light"
```

这里使用到了instance关键字，并且用一个**具体的类**TrafficLight替代了a。然后下面就复写`==`这个函数，这里貌似有个规则叫做`minimal complete definition`，因为Eq的定义是==和/=刚好是反一反的，所以这两个只复写一个就可以了。但是如果是简单的下面这样定义的，就两个都必须复写了。(因为haskell不知道这个两个函数之间有啥关系)

```haskell
class Eq a where
    (==) :: a -> a -> Bool
    (/=) :: a -> a -> Bool
```

试试结果：

```
ghci> Red == Red
True
ghci> Red == Yellow
False
ghci> [Red, Yellow , Green]
[Red light ,Yellow light ,Green light]
```

哟西~

创建实例的时候，也可以加类型限制，比如`instance (Eq m) => Eq (Maybe m) where`，保证m一定是Eq的实例先。

最后：使用`:info your_typeclass`，可以看看这个typeclass都有那些实例，比如`:info Eq`会看到上面的TrafficLight也在里面

### A yes-no typeclass

像js这些个弱类型语言，if语句里能塞各种东西，下面就在hs里用typeclass来实现下

```haskell
class YesNo a where
  yesno :: a -> Bool

instance YesNo Int where
  yesno 0 = False
  yesno _ = True

instance YesNo [a] where
  yesno [] = False
  yesno _ = True

instance YesNo Bool where
  yesno = id  -- id 是标准库函数，接收一个参数然后返回这个参数

instance YesNo (Maybe a) where
  yesno (Just _) = True
  yesno Nothing = False
```

代码倒是不难理解，定 sai义YesNo的时候没有写函数体，然后创建实例的时候分别实现函数体，再次强调a要塞一个具体的类型。

```
ghci> yesno []
False
ghci> yesno [0,0,0]
True
ghci> yesno $ length []
False
ghci> yesno "haha"
True
ghci> yesno ""
False
ghci> yesno $ Just 0
True
```

然后再实现个类似三目运算符的函数

```haskell
yesnoIf :: (YesNo a) => a -> b -> b -> b
yesnoIf condition yesVal noVal = if yesno condition then yesVal else noVal
```

```
ghci> yesnoIf [] "YEAH!" "NO!"
"NO!"
ghci> yesnoIf [2,3,4] "YEAH!" "NO!"
"YEAH!"
```

typeclass真的很像接口有木有，所有的实例都保证包含接口中定义的方法，ヽ(￣ω￣(￣ω￣〃)ゝ

### The Functor typeclass

可以用来map的就叫functor typeclass？List当然是属于这里面一种。看下定义：

```haskell
class Functor f where
	fmap :: (a -> b) -> f a -> f b
```

跟上一节一直强调的不同，说好的一个typeclass要接受的是一个具体的类，但是这里的f貌似不是，而是一个函数。定义了一个函数fmap，首先接受一个输入a类型输出b类型的函数。再看下map的实现：

```haskell
map :: (a -> b) -> [a] -> [b]
```

跟上面的fmap有些像，也是接受一个同样的函数，后面的结构也很像。所以其实map只是fmap用在数组上的一种实现而已，即map就是一个Functor的实例。

```haskell
instance Functor [] where
	fmap = map
```

注意这里并不是写的`instance Functor [a] where`，因为根据fmap的定义，**f其实是一个接受一个类型的类型构造子**，[]是类型构造子，而[a]才是具体类型，比如[Int]。因此，这里的f还可以是`Maybe`，因为`Maybe`是类构造子：

```haskell
instance Functor Maybe where
    fmap f (Just x) = Just (f x)
    fmap f Nothing = Nothing
```

f就像是一个盒子，里面有可能有很多值，或者没有值。

难怪叫functor classtype，而不是type classtype，因为接收的是一个产生类的函数而不是一个具体类。

### Kinds and some type-foo

多说一句，因为functor classtype接受的是一个函数，且虽然接受的参数是类型，但是**也可以进行partial apply**。这一节看下正式定义，看看类型是如何应用到类构造子上的。

像3，"hello world"，getName（函数也是值，因为也可以像其他值一样传递）都有各自的类型，类型就像是一个小标签，可以用来推断值，但是类型自己也有自己的小标签，称为：**kinds**，kind大概就是某个类型的类型。听起来很奇怪，但是这是一个很酷的概念。

在ghci中`:t`查看类型的kind

```
ghci> :k Int
Int :: *
```

`*`表示的是这是一个具体的类型，具体的类型就意味着他不用接受任何的参数，而只是表示一个类型。再看看Maybe

```
ghci> :k Maybe
Maybe :: * -> *
```

显示Maybe接受一个具体的类型，然后输出一个具体的类型，这就好像签名为Int -> Int 的函数的一样，输入一个Int类型的值输出一个Int类型的值。

```
ghci> :k Maybe Int
Maybe Int :: *
```

Just like I expected!

用`:k`查看类型的kind，就像`:t`查看值的类型一样

```
ghci> :k Either
Either :: * -> * -> *
```

这也没啥奇怪的，接受两个具体类型，返回一个，然后之前也提到类型构造子也是函数，即能柯里化，partial applyできる。这有啥用呢？当需要把像Either这样的构造子作为Functor typeclass，而Functor typeclass只能接受一个参数，这个时候，这个部分应用的功能有有用了。换言之，Functor想要一个`* -> *`的kind，所以要把`Either :: * ->  * -> *`变成`* -> *`。

分析下下面这个typeclass

```haskell
class Tofu t where
	tofu :: j a -> t a j
```

首先`j a`一定是一个具体类，也就是`*`，那么假设这个具体类就是a，那么j的kind就是`* -> *`，再看右边，右边也肯定是输出一个`*`，且知道了j的kind，那么不难推测出，t就是接受两个参数，一个是具体类a，一个是接受一个具体类并输出一个具体类的构造子j，然后输出一个具体类，即：`* -> (* -> *) -> *`。

那么接下来就来构造一个这样的拥有上述kind的类型：

```haskell
data Frank a b = Frank {frankField :: b a} deriving (Show)
frank = Frank {frankField = Just "hello i am frank"}
frank1 = Frank {frankField = "Yes"}
```

```
*Main> :t frank
frank :: Frank [Char] Maybe
*Main> :t frank1
frank1 :: Frank Char []
```

frankField肯定得是一个具体类型，那么`b a`一定是一个具体类型，那么b就是一个接受一个类型参数的构造子。因此Frank的kind肯定就是`* -> (* -> *) -> *`。然后试着让Frank成为Tofu的一个实例，

```haskell
instance Tofu Frank where
  tofu x = Frank x
```

```
*Main> let aaa =  tofu (Just "hhh")
// 如果直接 aaa 会报错，大概是他知道要怎么显示，为什么呢？因为啊这里的t其实是不确定的，也是就要传入的tofu的实例，我是这么理解的
*Main> :t aaa  
aaa :: Tofu t => t [Char] Maybe
// 指定类型为Frank
*Main> let aaae =  tofu (Just "hhh") :: Frank [Char] Maybe
*Main> aaae
Frank {frankField = Just "hhh"}
```

当想要创造某个typeclass的实例的时候，通常，并不需要像这一节这样做，而只需要将利用partial来调整类型的kind，比如`* -> * `或者`*`。但是知道他实际上是怎么运作的也是好的。

### Input and Output

Haskell是纯函数式语言，（imperative languages）命令式语言中通常是通过给计算机执行一系列的步骤来完成任务，而函数式更多的是定义这个东西是什么。

**hello world**

如果在Windows，就准备一个Cygwin之类的工具，建一个文件hello.hs

```haskell
main = putStrLn "hello , world"
```

然后到该目录下，执行` ghc --make helloworld`，顺利的话就会编译出一个exe文件。然后`./ hello`即可执行，打印出`hello , world`。

```
ghci> :t putStrLn
putStrLn :: String -> IO ()
ghci> :t putStrLn "hello , world"
putStrLn "hello , world" :: IO ()
```

putStrLn接受一个String，返回一个结果类型为()（空的tuple）的IO action，IO action是当被执行的时候会产生**副作用**的东西，通常是读取输入或者打印输出到屏幕。

那么什么时候一个IO action会被执行呢？那就是当main到来的时候，给IO action一个名字叫做main，然后执行代码，他就会被执行。

```haskell
main = do
  putStrLn "hello, what's your name?"
  name <- getLine
  putStrLn ("hey " ++ name ++ ", you rock!")
```

```haskell
ghci> :t getLine
getLine :: IO String
```

可以看到getLine是一个结果类型为String的IO action，等待用户在命令行的输入，然后将其表示为字符串。那么` name <- getLine`呢？他表示执行getLine这个IO action并且将结果的值绑定到name上。getLine的类型为`IO String`因此name的类型也就是String。

```haskell
nameTag = "Hello , my name is " ++ getLine
```

上述代码是否正确？答案当然是不正确，`++`需要参数是同一类型，而getLine的类型是IO String，所以不能将String和IO String相连接。IO action像是一个盒子，盒子里面有值，因此我们首先要做的是将这个值取出来，通过`<-`。

初学者可能会认为下述代码会将值绑定给name

```haskell
name = getLine
```

但是这样的结果只是给了getLine一个不同的名字而已。

每一个被执行过的IO action都会将他的结果封装起来，这也是为什么上面的代码可以写成这样：

```haskell
main = do
  foo <- putStrLn "Hello , what's your name?"
  name <- getLine
  putStrLn ("Hey " ++ name ++ ", you rock!")
```

只是foo的值为()而已，值得注意的时候，最后一行我们没有绑定任何东西，这是因为**在do代码块，最后一个action不能像前面一样绑定一个name**，等到后面学**monads**的时候就知道了，现在可以想象在do中会从最后一个action中自动提取值然后将其绑定给返回。

```haskell
main = do
  line <- getLine
  if null line
    then return ()
    else do
    putStrLn $ reverseWords line
    main
reverseWords :: String -> String
reverseWords = unwords . map reverse . words
```

可以像最开始那样make编译，然后`./`来执行代码，也可以直接`runhaskell youcode.hs`来执行。上述代码执行后，输入一个字符串，然后返回将字符串的每个单词反转后返回，**并且程序不会退出，直到输入了空字符串**。

在if语句中，如果输入的不是空，那么会进入另一个do代码块，其中会把之前拿到的输入经过reverseWords处理后打印到屏幕上，然后**执行main**，没错，这就是个递归，所以程序不会马上退出，而等到输入为空的时候，`then return ()`才退出程序。这里有个细节，如果在其他的命令时程序写递归的时候，通常都是`return main`这种形式的，但是这里是直接main的，原因大概是上面提到的do代码块中，最后一个action不用return吧？

值得注意的是，Haskell的return和其他命令式语言的return是不一样的，尤其在IO action中。

```haskell
main = do
  return ()
  return "HAHAHA"
  line <- getLine
  return "BLAH BLAH BLAH"
  return 4
  putStrLn line
```

如果是命令式语言，第一个return后面的代码都不会执行了，但是这里的执行结果是，打印出用户的输入。效果跟没有那几个return的效果是一样的。书中说在一个io上下文中，`return "hhh"`的类型是`IO String`，既然是这个类型，那就相当于是一个盒子封装了一个String的值而已。所以上述代码中的几个return封装了值，但是没有取出，当然就相当于没有。**return有点像反向的`<-`**。

```has
main = do
  a <- return "hello"
  b <- return "world!"
  putStrLn $ a ++ " " ++ b
```

下面看几个处理IO中有用的函数

`putStr`: putStrLn的不换行版本

`putChar`： 打印一个字符。上面的putStr实际上的定义就是递归调用putChar

```haskell
putStr :: String -> IO ()
putStr [] = return ()
putStr (x:xs) = do
    putChar x
    putStr xs
```

`print`：接受一个Show的实例，直接调用show函数显示对应的字符串。在ghci中敲个值然后回车，下面会显示刚打的字符，这实际上是调用的print。但是当我们想打印字符串的时候，通常会使用putStrLn而并不是print，因为使用print的结果会带有引号。

`getChar`：顾名思义

`when`：这个函数在` Control.Monad`中，要用得先`import Control.Monad`。他接受一个布尔值和一个IO action，当这个布尔值为True的时候执行后面这个IO action，否则返回一个`return ()`

```haskell
import Control.Monad
main = do
  c <- getChar
  when (c /= ' ') $ do
    putChar c
    main
```

`sequence`：接受一个IO action的列表，然后将这些action一个个挨个执行。下面两块代码效果是一样的：

```haskell
main = do
  a <- getLine
  b <- getLine
  c <- getLine
  print [a,b,c]
```

```haskell
main = do
  rs <- sequence [getLine , getLine , getLine]
  print rs
```

下面这个代码最后那一行打印有点看不懂，大概意思是这一行是IO action执行之后的结果？

```haskell
ghci> sequence (map print [1,2,3,4,5])
1
2
3
4
5
[(),(),(),(),()]
```

因为上述这种map一个函数产生一个IO action列表的操作很常见，所以就有了`mapM` 和`mapM_`，这两个的区别是后面这个丢掉了结果（就是最后那一排括号的打印）

```haskell
ghci> mapM print [1,2,3]
1
2
3
[(),(),()]
ghci> mapM_ print [1,2,3]
1
2
3
```

`forM`

```haskell
import Control.Monad
main = do
  colors <- forM [1,2,3,4] (\a -> do 
    putStrLn $ "Which color do you associate with the number " ++ show a ++ "?"
    color <- getLine
    return color)
  putStrLn "The colors that you associate with 1, 2, 3 and 4 are: " 
  mapM putStrLn colors
```

`color <- getLine`相当于一次unpack，前面提到过return有点反向`<-`的意思，这里下面的return就是一次repack，那这有什么意义呢，因此其实这两条语句直接写一个getLine也是可以的。

forM接受两个参数，第一个是一个数组，第二个是一个函数，作用大概是遍历这个数组的元素，然后将元素作为参数调用这个函数。然后把结果绑定到colors上，colors就是一个普通的字符串数组，然后mapM挨个打印出来。最后一行也可以用`forM colors putStrLn`代替。

再次说明的是，IO actions也是跟其他haskell中的值一样，可以作为参数传递给函数，作为返回值返回。What’s special about them is that if they fall into the main function (or are the result in a GHCI line), they are performed。

不要认为putStrLn是接受一个字符串，然后把他打印到屏幕，要认为他是接受一个字符串，**返回一个IO action**，当这个IO action被执行时，那些字符串才会被打印到屏幕上。

### Files and streams

getChar用来读取一个字符，getLine用来读取一行，其他语言中也会有类似这样的语句。现在让我们看看`getContents`，这玩意也是一个IO action，可以从标准输入中读取任何东西，直到遇到文件结束符end-of-file character。他厉害的地方在于他是lazy的。当执行`foo <- getContents `时，他不会马上读取输入，存到内存绑定给foo，他会说：我会在在你真正需要的时候读取输入。

随便建一个文件，叫caps_test：

```
I’m a lil’ teapot
What’s with that airplane food, huh?
It’s so small , tasteless
```

然后编译之前的一个forever的代码，caps.hs

```haskell
import Control.Monad
import Data.Char
main = forever $ do
  putStr "Give me some input: "
  l <- getLine
  putStrLn $ map toUpper l
```

```
ghc --make caps
cat cap_test | ./caps
```

然后就能看到caps_test的内容被大写输出。getContents可以代替forever干同样的事情，并使代码更短。

```haskell
import Data.Char
main = do
  contents <- getContents
  putStr (map toUpper contents)
```

这里的lazy过程是这样的：getContents绑定到contents时，他不会在内存中被表示为真实的字符串，而是像一个**promise**，承诺他最终会产生一个字符串，并且下面的map语句**也是一个promise**，承诺他会map一个contents，而直到putStrLn开始的时候，他就会朝之前的promise喊：来一个大写过的contents，map听到后就之前promise喊：来个真的line，然后getContents开始读取命令行的输入。输入完后，开始喊：再下一行，直到读取完毕。

因为像上述这种「通过读取输入，然后经过一个函数操作过后，返回结果」的模式很常见，因此hs有一个函数专门应对，叫做`interact`，上述代码能更加精简，如下：

```haskell
import Data.Char
main = interact $ map toUpper
```

よさそうですね，interact就更linux中的pipe操作符`|`很像了。

**如何读写文件**

```haskell
import System.IO
main = do
  handle <- openFile "girlfriend.txt" ReadMode
  contents <- hGetContents handle
  putStr contents
  hClose handle
```

openFile的签名：`openFile :: FilePath -> IOMode -> IO Handle`

FilePath 就是一个字符串而已：`type FilePath = String`

IOMode是一个枚举：`data IOMode = ReadMode | WriteMode | AppendMode | ReadWriteMode`

openFile返回一个用特定的mode打开特定文件的IO Action，把这个结果绑定到某个东西上的话，就得到一个Handle，Handle类型的值表示文件所在的位置，读取文件但是又不将其绑定起来（也就是你没有handle），那对于该文件就啥也不能干，这是很愚蠢的。

继续看hGetContents函数，`hGetContents :: Handle -> IO String`，这个函数跟getContents很像，不同的是getContents会自动读取标准输入，而hGetContents是接受一个指示了文件读取源头的file handle，在其他方面，他们都是同样的工作。同样是lazy的，只有在真正需要的时候才会将内容加载到内存中，所以，如果有一个很大的文件的话，也不用担心内存被耗尽的问题。

注意区别file handle和实际的文件内容这两者，如果把整个文件系统想象成是一个书，而每个file就是代表着书中的章节，那么file handle就代表着你正在读/写的章节的书签。

另一个可以实现上述代码的函数叫做`withFile`：

```haskell
import System.IO
main = do
  withFile "girlfriend.txt" ReadMode (\handle -> do
    contents <- hGetContents handle
    putStr contents)
```

相当于把后面几行整合成一个函数然后当作withFile的参数传入了。

`withFile :: FilePath -> IOMode -> (Handle -> IO r) -> IO r`

与hGetContents类似的还有一些带h开头的函数，hGetLine，hPutStr等等。

更简单的方式是使用`readFile`，`readFile :: FilePath -> IO String`

返回的是`IO String`，那么就可以直接当作字符串绑定到something上，并且读取过程是lazily, of course，这个比readFile更方便，省去了绑定handle，通过handle得到文件内容，然后再关闭handle。我们不需要再去手动做这些了，因为haskell帮我在readFile里都做了。

```haskell
import System.IO
main = do
  contents <- readFile "girlfriend.txt"
  putStr contents
```

`writeFile`：`writeFile :: FilePath -> String -> IO ()`

```haskell
import System.IO
import Data.Char
main = do
  contents <- readFile "girlfriend.txt"
  writeFile "girlfriendcaps.txt" (map toUpper contents)
```

`appendFile`签名和writeFile一样，不一样的就是他是追加内容。

```haskell
import System.IO
main = do
  todoItem <- getLine
  appendFile "todo.txt" (todoItem ++ "\n")
```

之前提到`contents <- hGetContents handle`不会马上将所有内容都读取到内存中，他实际上是像从文件到输出之间连接了一根管道，文件看作stream。那么如果你问这根管子有多宽呢？多久访问一次磁盘呢？对于文本文件，通常默认的buffering就是line-buffering，那就意味着一次读取一个文件的最小单位就是一行。对于二进制文件，默认的buffering通常是block-buffering，那意味着他是按块来读取的（ chunk by chunk），块大小依操作系统而定。有个叫hSetBuffering的函数能设定handle的buffering，如果想要减少对磁盘的访问，可以设置一个大的buffering。

`!!`居然是个函数？但是`:t`貌似看不到类型，用在delete上，要使用delete要先`import Data.List`

```haskell
a = [1..10]
b = delete (a !! 1) a
```

像这样就能删掉a中索引为1的元素，然后返回一个新数组给b。`a !! 1`就是取数组中对应索引位置的元素。

### Command line arguments

如果要写一个在终端运行的脚本或者应用，那么命令行参数是必不可少的。幸运的是，haskell有很好的方式来拿到这些参数。

```haskell
import System.Environment
import Data.List
main = do
  args <- getArgs
  progName <- getProgName
  putStrLn "The arguments are:"
  mapM putStrLn args
  putStrLn "The program name is:"
  putStrLn progName
```

```
ghc --make .\cmd_line.hs
./cmd_line a b c "hello cmd"
```

results:

```
The arguments are:
a
b
c
hello cmd
The program name is:
cmd_line.exe
```

接下来拿之前的todo代码完善下（todolist真是大家都喜欢的实践:smile_cat: ），该程序具有查看，添加，删除这三种功能。通过类似如下命令来操作：

```
todo add todo.txt "find my sword of power"
todo view todo.txt
todo remove todo.txt 2
```

书上这一块的代码我倒是看懂了，只是败给了缩进问题:sob:。反正代码不难吧，就不贴了。

### Randomness

很多时候都会需要随机数据，随机数据在编程也有很用，不过，当然那都是伪随机。「因为我们都知道，随机性的唯一真正来源是一只独轮车上的猴子，一只手拿着一只奶酪，另一只手拿着一只屁股。」(get不到这个玩笑的笑点)，这一节来看下，Haskell如何生成看似随机的数据。

Haskell是纯函数式的，那就意味着他有referential transparency（翻译成引用透明性？），意思就是一个函数，每次都给他同样的参数，那么他每次的结果一定是一样的。这是个很酷的特点，让我们更好的推断程序，然而，这会使得生成随机数有点棘手。

其他语言实现随机数通常都是收集你电脑的信息啦，当前时间啦等等这些把他组合起来，然后就得到了随机数。

在Haskell中，System.Random这个模块中有你搞随机数需要的所有函数，说是这么说，但是真正我去敲的时候又说找不到模块（摊手。

### Bytestrings

List是个很好的数据结构，所以我们到处都在用他。同时也有一大堆相应操作List的函数，并且由于hs的惰性，只有在真正需要的时候才进行评估（evaluation ），所以无限的List也没有问题。这也是为什么在从标准输入中读取或者从文件中读取的时候，List可以被用来表示流的原因。

然而，把文件作为字符串来处理有一个缺点：会变得很慢。String这个类型不过是[Char]的type synonym，Char没有固定大小，他需要几个字节来表示Unicode等字符。并且，记住他是lazy的，如果你有一个数组`[1, 2, 3, 4]`，只有在真正需要的时候才开始评估，所以，整个list其实是不如说是一个List Promise，我承诺给提供一个list。`[1, 2, 3, 4]`其实是`1:2:3:4:[]`的语法糖，如果第一个元素被强行evaluated了，比如print，那么剩下 的`2:3:4:[]`依然是lazy的，不用费什么脑子就知道这种做法（一些列的promise）其实效率很低。

虽然大多数情况下不会被上面的问题所困扰，只有在处理大文件的时候。这就是为什么hs会有Bytestrings，Bytestrings有点想Lists，只是他每个元素都是一个字节（或者说八个位），他处理惰性的方式也不一样。

Bytestrings有两种类型：strict和lazy。 

Strict bytestrings在`Data.ByteString`中，，他完全去除了lazy，没有引入什么promise。他就单纯表示在数组中的一系列的字节，因为没有lazy，所以你也无法拥有一个无限的bytestrings，如果你评估了第一个字节，那么你就评估了整个字节串。好处是上面的问题不再是问题，因为没有了promise，坏处就是他会很快填满你的内存，因为他会立即读入内存。

另一种在`Data.ByteString.Lazy`中，虽然是lazy的，但是不像List那么Lazy，因为他是chunk by chunk的lazy，一个chunk大小为64k，所以如果你评估了一个字节，那么跟着的64k都被评估了。然后剩下的部分是promise的，所以说他是chunk by chunk的promise。

`Data.ByteString.Lazy`中有很多函数的都跟`Data.List`的函数有着同样的名字，只是参数类型不一样，这意味着这些函数的表现跟List的对应的函数的表现是一样的。因为名字是一样的，所以在导入模块的时候就注意一点了。

```haskell
import qualified Data.ByteString.Lazy as B
import qualified Data.ByteString as S
```

`pack :: [Word8] -> ByteString`。

接受一个Word8的数组，输出一个字节串，word8就是小一点的Int，只有8位而已。也就是说范围是0-255。

```
*Main>  B.pack [98..120]
"bcdefghijklmnopqrstuvwx"
```

`unpack`，顾名思义，反向pack。

下面来写一个复制文件的程序，虽然 System.Directory中有copyFile这个函数。

```haskell
import System.Environment  
import qualified Data.ByteString.Lazy as B  
  
main = do  
    (fileName1:fileName2:_) <- getArgs  
    copyFile fileName1 fileName2  
  
copyFile :: FilePath -> FilePath -> IO ()  
copyFile source dest = do  
    contents <- B.readFile source  
    B.writeFile dest contents  
```

如果不使用bytestrings，写出来的代码也差不多长这样，不同的只是`B.readFile`替代了`readFile`，通常来说把一个原本是strings写的代码换成bytestrings的版本并不是很困难。在你觉得当前性能不太行的时候，可以试下bytestrings。

### Functionally Solving Problems

#### Reverse Polish notation calculator

这种计算器就是以前做题会遇到的：用栈来做四则运算，输入一个算式字符串就算出结果。

- 首先，考虑这个函数的类型，大概长这样：`solveRPN :: (Num a) =>String -> a`
- 因为这个字符串肯定会是空格隔开的，因此，先分割成字符数组，可是使用words函数
- 然后考虑如何遍历这个数组？从左到右遍历，可以选择左fold
- 如何表示栈呢？就用list好了，并且从list头部来压入元素，也就是说list的头部永远是栈顶，这是因为**从前面加比从后面加来的快**

```haskell
import Data.List
solveRPN :: (Num a, Read a) => String -> a
solveRPN = head . foldl foldingFun [] . words
  where foldingFun (x:y:ys) "*" = (x * y):ys
        foldingFun (x:y:ys) "+" = (x + y):ys
        foldingFun (x:y:ys) "-" = (y - x):ys
        foldingFun xs numberString = read numberString:xs
```

函数第一行为了去掉括号，用了点符号，所以写成了这样，不然就得写成下面这样：

```haskell
solveRPN expression = head (foldl foldingFunction [] (words expression))
```

注意区别点符号和美元符号，点符号是连接的两个函数，然后输出一个值，执行方式是从右到左，像是反方向的管道操作。而美元符号，在他右边的都先执行。点符号可以连接几个函数而组成一个新的函数，通常会需要一个输入来触发，美元符号则一般不会需要输入参数。

```
*Main> solveRPN "10 4 3 + 2 * -"
-4
*Main> solveRPN "90 34 12 33 55 66 + * - +"
-3947
```

这个代码很简短，看着很不错，但是容错是比较差的，很容易出问题，等学到了monads就能写一个更好的了。
