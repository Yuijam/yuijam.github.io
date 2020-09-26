---
layout: post
title: haskell-part2
tags: [haskell]
---

### Functors, Applicative Functors and Monoids

#### Functors redux

学两个新的 functor 引用，`IO` 和`(->) r`

之前有说过，如果某个值的类型是IO String, 那意味着他是一个IO action，执行他会得到一个string，可以用`<-`符号来绑定结果到一个名字上。我们提到过，I / O action就像是一只有小脚丫的盒子，可以向外移动并为我们从外部获取一些值，我们可以检查拿到的值，但是检查完后要把他包装回IO。

<!-- more -->

看看IO是怎样的一个Functor实例：

```haskell
instance Functor IO where  
    fmap f action = do  
        result <- action  
        return (f result)  
```

result绑定了action的值后，再作为参数传递给f来执行，然后return回去，之前提到过return相当于反向的`<-`操作，一个是从盒子里拿出东西来，一个是把东西塞回盒子里。因此，f执行后会返回一个IO action。

```haskell
main = do line <- getLine   
          let line' = reverse line  
          putStrLn $ "You said " ++ line' ++ " backwards!"  
          putStrLn $ "Yes, you really said" ++ line' ++ " backwards!"  
```

上面这个代码很好理解，接受用户输入，将其reverse后返回。那来看看如何用fmap重写：

```haskell
main = do line <- fmap reverse getLine  
          putStrLn $ "You said " ++ line ++ " backwards!"  
          putStrLn $ "Yes, you really said" ++ line ++ " backwards!"  
```

另一个之前一直在用，但是不知道他其实是一个functor实例的functor是`(->) r`，这啥玩意？`r -> a`和`(->) r a`的意思是一样的，看出来了吗？`->`就像一个`+`一样，`(+) 2 3`和`2 + 3`是一样的。`(->)`不同的是，他是一个接受两个类型参数的类型构造子，就像`Either`一样。但是记得，成为一个Functor实例，得是接受**一个**类型参数的，因此`(->)`不能成为Functor实例，需要partially后`(->) r`。

```haskell
instance Functor ((->) r) where  
    fmap f g = (\x -> f (g x))  
```

再来看看fmap长啥样：

```haskell
fmap :: (a -> b) -> f a -> f b
```

接下来用` (->) r `来替换上面所有的f，得到：

```haskell
fmap :: (a -> b) -> ((->) r a) -> ((->) r b)
```

然后要做的就是换成中缀表达式：

```haskell
fmap :: (a -> b) -> (r -> a) -> (r -> b)
```

将一个函数映射成另一个函数，然后观察这三个函数的输入输出，一个函数的输入是另一个函数的输出，然后输出的函数的是一个函数的输入，另一个函数的输出，发现这玩意有点像什么了麽？对，函数组合，pipe。fmap就是一个函数组合而已。另一个写法是：

```haskell
instance Functor ((->) r) where  
    fmap = (.)  
```

```
ghci> (*3) `fmap` (+100) $ 1  
303  
ghci> (*3) . (+100) $ 1  
303 

```

fmap的完整定义是：`fmap :: Functor f => (a -> b) -> f a -> f b`。在上文中提到的时候少写了Functor f这个限制条件。在最开始学习curried function的时候，我们说所有的haskell函数实际都只接受一个参数。`a->b->c`也可以写成`a->(b->c)`，这样就显得curry更明显了。

同样的道理，如果写成` fmap :: (a -> b) -> (f a -> f b) `，我们就可以不把他看作是接受一个函数和一个functor然后返回一个functor，而是接受一个函数，返回一个新函数。从`(a -> b) `到` (f a -> f b) `，我们把这个称之为**lifting a function**。

你可以认为fmap是一个**接受一个函数和一个functor，通过这个函数来映射这个functor得到一个新的functor**的函数，也可以看作是接受一个函数，然后lifting这个函数，使得可以在functor上操作运行。这两种看法都对。

接下来看看functor laws

- 如果用函数id来映射一个functor，那么我们最终得到的functor要跟原来的functor是一样的

  比如来看下Maybe的fmap实现：

  ```haskell
  instance Functor Maybe where  
      fmap f (Just x) = Just (f x)  
      fmap f Nothing = Nothing  
  
  ```

  这里我们想象下f是id，那么`fmap id (Just x)`的结果就是`Just (id x)`，然后因为id就是返回丢给他的参数，因此最终结果就等于`Just x`。这就是所谓的用id来映射一个functor将得到这个functor本身的意思。

- 第二条law说，组合两个函数，然后映射这个组合后的函数得到的结果，应该要和以此映射两个函数的结果一样。` fmap (f . g) F = fmap f (fmap g F) `

  还拿Maybe来举例：` fmap (f . g) (Just x) `====` Just ((f . g) x) `===` Just (f (g x)) `，

  ` fmap f (fmap g (Just x)) `===`fmap f (Just (g x))`===`Just (f (g x))`

如果一个类型遵守上述两条规则，那么在映射他的时候就可以相信这个类型具有其他functor都有的一些基本行为。值得一提的是，并不是所有Functor的实例都满足这两条，你完全可以造一个类型，让他实现fmap，能用并不会报错，但是不满足上述规则。但是标准库里的都是满足的，可以放心用。

也因此，在构造一个Functor实例的类型的时候，要花点时间检查下是否满足上述规则，做得多了，就能很直观的分辨出这个类型是否满足条件。

#### Applicative functors

这一节讲应用函子，他是一种增强的函子，在Control.Applicative模块中，表示为Applicative 类型类。

当我们在函子上映射函数时，通常这个映射函数是接受一个参数的，那么如果遇到接受两个参数的函数呢？比如`*`接受两个参数。当执行`fmap (*) (Just 3)`的时候，会得到什么呢？上文提到了Maybe是如何实现Functor实例的，可以推出，上述代码的结果会是`Just (* 3)`，有趣，我们在Just里放进了个函数。

```
*Main> :t fmap (++) (Just "hey")
fmap (++) (Just "hey") :: Maybe ([Char] -> [Char])

```

那可以如何使用呢？

```haskell
 let a = fmap (*) [1,2,3,4]
 fmap (\f -> f 9) a -- [9,18,27,36]

```

a被映射完后成了一个partial函数数组，然后再映射这个数组，函子（这里的a）内部的任何内容都将做为参数传递到映射函数上（这里的`\f -> f 9`）。很好理解。

那如何有一个函子`Just (3 *)`，另一个函子`Just 5`，希望把第一个函子中的函数拿出来，然后映射到第二个函子上，就做不到了。之前都是在map一个普通的函数(`\f -> f 9 `)，而不是这种被裹在函子中的函数。这个就需要介绍Applicative 类型类了。

```haskell
class (Functor f) => Applicative f where  
    pure :: a -> f a  
    (<*>) :: f (a -> b) -> f a -> f b  

```

第一行告诉我们，要想成为Applicative的一部分，你首先得是一个Functor，这也说明如果一个类型构造子是Applicative的一部分，那么他同时也是一个Functor，可以使用fmap。

第二行，一个叫做pure的方法，这里的f代表一个应用函子实例。接收任意类型，返回一个塞了一个值在里面的应用函子。

第三行，这玩意很像`fmap :: (a -> b) -> f a -> f b`，这就是传说中的增强版fmap，原版fmap是接受一个函数和一个函子，然后把这个函数应用到这个函子里面。而 **<\*>** 是接受一个里面塞了一个函数的函子，以及另一个函子，这里他做的就是把函子里的函数提取出来，然后作用到第二个函子上。

```haskell
instance Applicative Maybe where  
    pure = Just  
    Nothing <*> _ = Nothing  
    (Just f) <*> something = fmap f something  

```

有了这个，上面提到那个问题就可以解决了，从函子中的函数拿出来去映射另一个函子，

```
*Main> Just (+3) <*> Just 9
Just 12
*Main> pure (+3) <*> Just 10
Just 13
*Main> Nothing <*> Just "woot"
Nothing
*Main> pure (+) <*> Just 3 <*> Just 5
Just 8

```

`pure f <*> x`要等于`fmap f x`，这是 applicative laws 中的一条。`pure f <*> x <*> y <*>`可以写成`fmap f x <*> y <*> `。Control.Applicative导出了一个叫做`<$>`的函数，其实只是把fmap当作一个中缀操作符。这样就能继续写成`f <$> x <*> y <*> z`

```haskell
(<$>) :: (Functor f) => (a -> b) -> f a -> f b  
f <$> x = fmap f x  

```

```
*Main> (++) <$> Just "johntra" <*> Just "volta"
Just "johntravolta"

```

`(++) <$> Just "johntra"`的结果是`Just ("johntra"++)`，一个装了函数的函子，接下来就很好理解了。

数组也是一个应用函子，

```haskell
instance Applicative [] where  
    pure x = [x]  
    fs <*> xs = [f x | f <- fs, x <- xs] 

```

pure跟之前一样，接受一个值，丢到默认context中，下面这行，这种形式叫 list comprehension ，在最开始的时候就说到了，意思是拿fs中的东西去映射xs中的东西。

```haskell
*Main> [(*0),(+100),(^2)] <*> [1,2,3]
[0,0,0,101,102,103,1,4,9]
*Main> [(+),(*)] <*> [1,2] <*> [3,4]
[4,5,5,6,3,4,6,8]
*Main>  (++) <$> ["ha","heh","hmm"] <*> ["?","!","."]
["ha?","ha!","ha.","heh?","heh!","heh.","hmm?","hmm!","hmm."]

```

莫名其妙，看着还挺好玩。list comprehension的形式换成<*>风格：

```haskell
*Main> [ x*y | x <- [2,5,10], y <- [8,10,11]]
[16,20,22,40,50,55,80,100,110]
*Main> (*) <$> [2,5,10] <*> [8,10,11]
[16,20,22,40,50,55,80,100,110]

```

还有一个应用函子是之前学过的IO

```haskell
instance Applicative IO where  
    pure = return  
    a <*> b = do  
        f <- a  
        x <- b  
        return (f x)  

```

这个pure我有点不是很理解，书上说：由于pure就是将值放在最小的上下文（minimal context）中，而该上下文仍然保留其结果。啥叫minimal context呢，有待理解。

然后下面的内容反倒很好理解，如果`<*>`用于IO，那么类型就是`(<*>) :: IO (a -> b) -> IO a -> IO b`，如何运作的也一目了然。

```haskell
myAction :: IO String  
myAction = do  
    a <- getLine  
    b <- getLine  
    return $ a ++ b

```

这个代码很简单接受两次输入，然后把他们连接起来输出。只是看到`$`我一时有点懵逼，美元符号虽然已经学过，但是写在return这里有点没反应过来，其实是说明这条语句先把美元符号右边的执行完了再返回，如果不写这个符号就要给`a ++ b`加上括号。

上面的代码也用 applicative 风格来写：

```haskell
myAction :: IO String  
myAction = (++) <$> getLine <*> getLine

```

`(++) <$> getLine <*> getLine`的结果是一个IO Action，这就以为这也可以这样写

```haskell
main = do  
    a <- (++) <$> getLine <*> getLine  
    putStrLn $ "The two lines concatenated turn out to be: " ++ a  

```

`(->) r`也是应用函子

```haskell
instance Applicative ((->) r) where  
    pure x = (\_ -> x)  
    f <*> g = \x -> f x (g x) 

```

最后这行不是很理解。。。。当`<*>`连接两个函数函子的时候，结果是一个函数：

```haskell
*Main> (+) <$> (+10) <*> (+5) $ 9
33

```

参数丢进每个函数，然后把结果丢到最前面的函数（+）里。

事实上有很多方法让数组成为应用函子，一种方式就是上面提到的直接使用`<*>`连接。

```haskell
*Main> [(+3),(*2)] <*> [1,2]
[4,5,2,4]

```

第一个数组中的每个函数都会作用于后面数组中的所有元素。那我们有可能需要的是，那种一一对应的那种呢？第一个函数对应第一个元素这种。这就有了ZipList

```haskell
instance Applicative ZipList where  
        pure x = ZipList (repeat x)  
        ZipList fs <*> ZipList xs = ZipList (zipWith (\f x -> f x) fs xs)  

```

这里的pure也值得回味，返回的是一个无限数组。要使用这玩意要导入`:m Control.Applicative`

```haskell
Prelude > :m Control.Applicative
Prelude Control.Applicative> getZipList $ (+) <$> ZipList [1,2,3] <*> ZipList [100,100,100]
[101,102,103]
Prelude Control.Applicative> getZipList $ (,,) <$> ZipList "dog""
[('d','c','r'),('o','a','a'),('g','t','t')]

```

这里有个新玩意`(,,)`，仔细一看还挺可爱🐤，这玩意就相当于`\x y z -> (x,y,z)`，同样`(,)`就相当于`\x y -> (x,y)`。haskell真是简洁的可怕……

#### The newtype keyword

跟data一样都能创建类型，并且newtype更快。不同的是这个限定了只能有一个构造函数并且只有一个字段。为什么需要这玩意呢？我大概这样理解的，像数组他本来就实现了Functor了，那么在fmap他的时候行为就定了，但是你想要在fmap的时候实现别的行为，这个时候就需要实现一个新的Functor引用，但是一种类型只能实现一次不是麽，那就用重新构造一个新类型，里面就包一下本来要用的那个类型就好了，这就有了newtype。

比如，想tuple在fmap的时候是默认操作后面那个数的，那如果想要操作前面那个数咋办呢？就构造一个新类

```
Prelude> fmap (+3) (1, 3)
(1,6)

```

```haskell
newtype Pair b a = Pair { getPair :: (a, b)}

instance Functor (Pair c) where
  fmap f (Pair (x, y)) = Pair (f x, y)

```

```
*Main> getPair $ fmap (+3) $ Pair (1, 3)
(4,3)

```

这段代码很少，看着也简单，但是还是让我稍微想了一会儿。有几个问题，首先为什么Pair的类型参数是`b a`而不是`a b`，然后c又是干嘛的，然后getPair怎么理解。

首先这个c其实很迷惑，如果换成b就很好理解了。这就是因为实现Functor时接受的这个函数只有能有一个参数，因此做了一个patial函数而已。而如果Pair的类型参数调换顺序的话，是会报错的，因为什么呢？回想下fmap的类型：

```haskell
fmap :: Functor f => (a -> b) -> f a -> f b

```

fmap的f实际上就是Pair c，相当于：

```haskell
fmap :: (a -> b) -> Pair c a -> Pair c b  

```

然后如果Pair的类型参数调换过来的话，那么被partial的就是a，也就是Pair里面的tuple的第一个值的类型，而等待接收，或者说等待处理的类型变成了b。这样`Pair (f x, y)`就有问题，**f的参数一定那个要等待处理的类型**，虽然这里理解感觉有点奇怪，先暂时这样想吧。

还有一个迷惑的地方是，下面的`Pair c`和`Pair (x, y)`，前者是类型构造子，而后者是值构造子。

```haskell
instance Functor (Pair c) where
  fmap f (Pair (x, y)) = Pair (f x, y)

```

然后是getPair，这玩意不了解的话可以再看看data构造类型那块内容

```haskell
getPair :: Pair b a -> (a, b)

```

**On newtype laziness**

newtype更快，而且唯一能干的事情就是把一个已经存在的类型转换成另外的类型。当然也是lazy的。

当输入undefined的时候会报错：

```
ghci> undefined  
*** Exception: Prelude.undefined  

```

而下面这样却不会报错，因为lazy的原因，hs不会真的去计算后面的内容。

```
ghci> head [3,4,5,undefined,2,undefined]  
3

```

现在考虑下面的代码：

```haskell
data CoolBool = CoolBool { getCoolBool :: Bool }
helloMe :: CoolBool -> String  
helloMe (CoolBool _) = "hello" 

```

CoolBool用data构造，并且只有一个值构造子，只有一个类型为Bool的字段。

```
*Main> helloMe undefined
"*** Exception: Prelude.undefined

```

为什么会报错呢？因为data构造的类型会有很多值构造子（虽然这里只有一个），所以hs为了去检测给到的参数类型能用下面的那个模式匹配，会去计算给到的这个值，所以计算到了undefined，自然会报错。

换成newtype定义：

```haskell
newtype CoolBool = CoolBool { getCoolBool :: Bool }

```

其他都不变，就改了个关键字newtype，然后`helloMe undefined`就不会报错了。因为hs知道newtype定义的类型肯定只有一个值构造子，所以他不需要去提前好要匹配那个模式，直接把值往里扔就好了。

这告诉我们，虽然newtype和data很相似，但是有些处理机制其实是不一样的。

#### Monoids

当创建一个类型的时候，要考虑他支持什么行为，要表现成什么样，要实现哪个类型类。

函数`*`接受两个参数，完成乘法操作，并且`1 * x == x *1`，类似这种的还有`++`，也是接受两个参数，也同样有类似的特点，比如`[1,2,3] ++ [] == [] ++ [1,2,3]`。他们还有一个共同点就，满足像是交换律的那种规律。

```
ghci> (3 * 2) * (8 * 5)  
240  
ghci> 3 * (2 * (8 * 5))  
240  
ghci> "la" ++ ("di" ++ "da")  
"ladida"  
ghci> ("la" ++ "di") ++ "da"  
"ladida"

```

注意到了这些特点，然后就有了monoids！上面的1之于`*`，[]之于`++`，被称作**identity value**

```haskell
class Monoid m where  
    mempty :: m  
    mappend :: m -> m -> m  
    mconcat :: [m] -> m  
    mconcat = foldr mappend mempty 
```

这个类型类定义在`import Data.Monoid`中，m是一个具体类型，而不是像Maybe那样的类构造子，因为m并没有接受任何类型参数。

第一个函数mempty，并不是一个真的函数，因为他不接受参数，所以是一个多态常量，表示特定monoids的identity value。

然后mappend，不要想太多，就是接受连个参数，返回第三个而已。

然后mconcat，接受一个monoids数组，然后reduce成单个值。下面有给了一个默认的实现。在实现一个monoid实例的时候，通常只要实现mempty和mappend就够了，因为默认的mconcat通常来是够用的。

在讨论monoid特定实例之前，先看下他的基本规则。

- mempty \`mappend\` x = x
- x \`mappend\` mempty = x
- (x \`mappend\` y) \`mappend\` z = x \`mappend\` (y \`mappend\` z)

**数组的实现**

```haskell
instance Monoid [a] where  
    mempty = []  
    mappend = (++)  
```

代码很好懂，要注意的是这里写的是[a]，而不是[]，因为这里需要的是一个**具体类型**。

```
ghci> [1,2,3] `mappend` [4,5,6]  
[1,2,3,4,5,6]
ghci> mconcat [[1,2],[3,6],[9]]  
[1,2,3,6,9]  
ghci> mempty :: [a]  
[]
```

#### Using monoids to fold data structures

数组可以用来fold，但是数组其实不是唯一可以用来fold的数据结构，我们几乎可以对任何数据结构定义fold。因此就有了**Foldable**类型类，就像Functor可以用来map，Foldable可以用来fold。

```
Prelude> :t foldr
foldr :: Foldable t => (a -> b -> b) -> b -> t a -> b
```

这个类型还算好理解吧，把`t a`里的a拿出来和b一起丢到函数`a -> b -> b`中，想想reduce，b其实就相当于初始值吧

```
ghci> foldr (*) 1 [1,2,3]  
6 
```

一种把一个类型构造子做成Foldable的方式是直接实现foldr，但是另一种更简单的方式是实现foldMap函数，foldMap也是Foldable类型类的一部分

```
Prelude> :t foldMap
foldMap :: (Foldable t, Monoid m) => (a -> m) -> t a -> m
```

### A Fistful of Monads

回顾一下，functor可以接受一个函数来map一个函子里的值，然后applicative functor，接受的一个里面放了函数的函子，并将那个函数拿出来作为map的函数，得到的结果是保留了上下文的，上下文指的是，比如`'a'`只是一个普通的字符串，但是`Maybe 'a'`就叫带了上下文了。这章开始讲Monads，一种applicative functor的增强版，就好比应用函子是函子的增强版一样。

#### Getting our feet wet with Maybe

考虑下应用函子是如何做到最后结果保留了上下文呢？需要一个这样的函数：接受一个奇怪的值，接受一个接受正常值并返回一个奇怪值的函数，然后返回一个奇怪值。还拿Maybe来说：

```haskell
applyMaybe :: Maybe a -> (a -> Maybe b) -> Maybe b  
applyMaybe Nothing f  = Nothing  
applyMaybe (Just x) f = f x  
```

```
*Main> Just 3 `applyMaybe` \x -> Just (x+1)
Just 4
```

#### The Monad type class

Monad也有他自己的类型类

```haskell
class Monad m where  
    return :: a -> m a  
  
    (>>=) :: m a -> (a -> m b) -> m b  
  
    (>>) :: m a -> m b -> m b  
    x >> y = x >>= \_ -> y  
  
    fail :: String -> m a  
    fail msg = error msg  
```

第一行，要知道的时候，m首先得是应用函子，但是这里没有写`class (Applicative m) = > Monad m where`，他这里个理由我没太懂，说是Haskell在制作的时候并没有想到？但是结论是要记住每一个Monad都是应用函子，即使这里的声明里没有写。

第二行，return的作用跟应用函子类型类的pure一样，只是换了个名字，作用都是接受一个值，返回一个保存了该值的最小上下文，还记得IO的时候用到的return吗？那时候说的是return就是绑定的反向操作，绑定是将一个值从盒子里取出来，而return是将值塞回去。

值得强调的是：hs的return跟其他大多数语言的return是不一样的，他并不会结束函数的执行，而只是接受一个值，将其丢进最小上下文中。

第三行，绑定，或者说函数的应用。

第四行，现在不会讲太多这个，他有默认实现，并且我们在制作monad引用的时候几乎不会实现他

接下来的fail，暂时不需要考虑太多。

看看Maybe是如何是实现Monad的：

```haskell
instance Monad Maybe where  
    return x = Just x  
    Nothing >>= f = Nothing  
    Just x >>= f  = f x  
    fail _ = Nothing  
```

`>>=`和之前的applyMaybe一样。

```
*Main> Just 9 >>= \x -> return (x*10)
Just 90
```

这里要要注意的是这个lamda函数，之前的applyMaybe是写死了返回Just的，而这里是用的return。（这就是return的妙用吗？

#### do notation

还记得do吗？在讲IO的时候出现过，作用是将多个IO action融合成一个，其实do不只是能作用与IO，他能作用与任何monad。

```haskell
Just 3 >>= (\x -> Just (show x ++ "!"))
Just 3 >>= (\x -> Just "!" >>= (\y -> Just (show x ++ y))
let x = 3; y = "!" in show x ++ y
```

这三行的输出都是一样的：`3!`，不同的是前两个的值是 monadic ，有有可能失败的上下文。

```haskell
foo :: Maybe String  
foo = Just 3   >>= (\x -> 
      Just "!" >>= (\y -> 
      Just (show x ++ y))) 
```

```haskell
foo :: Maybe String  
foo = do  
    x <- Just 3  
    y <- Just "!"  
    Just (show x ++ y)  
```

do的写法让人看起来像是拥有了可以临时提取出Maybe的值而无需检查这个值是Just还是Nothing的能力，如果中间出现了Nothing，那最后的结果也是Nothing。比如：

```haskell
foo = do  
    x <- Just 3  
    y <- Just "!"
    z <- Nothing
    Just (show x ++ y) 
```

do看起来很像是命令式编程，但是其实do中的每一行都是连续的，依赖着前一行的。从上面的代码也能看出来，z并没有被用到，但是最后的结果还是Nothing。

当在do中不写`<-`时就好像在将`>>`放在 要忽略其结果的monadic value 后面，这比`_ <- Nothing`要简洁，效果是同样的。

```haskell
foo = do  
    x <- Just 3  
    y <- Just "!"
    Nothing
    Just (show x ++ y) 
```

在do中绑定值的时候可以使用模式匹配，就像let表达式和函数参数那样。

```haskell
justH :: Maybe Char  
justH = do  
    (x:xs) <- Just "hello"  
    return x 
```

一个模式匹配失败了会去匹配下一个，如果所有的匹配都失败了，在let中会立刻报错，而如果在do中，函数fail会被调用。

```haskell
fail :: (Monad m) => String -> m a  
fail msg = error msg  
```

默认情况下会使我们的程序崩溃掉，但是monads是包括了会失败的上下文的，比如Maybe，所以通常会实现自己的fail函数。像Maybe的：

```haskell
fail _ = Nothing 
```

他忽略了错误消息，并直接返回一个Nothing，

```haskell
wopwop :: Maybe Char  
wopwop = do  
    (x:xs) <- Just ""  
    return x
```

#### The list monad

这一节，我们将研究如何使用列表的monad形式以清晰易读的方式将不确定性（ non-determinism ）引入我们的代码中。

```haskell
instance Monad [] where  
    return x = [x]  
    xs >>= f = concat (map f xs)  
    fail _ = [] 
```

```
Prelude> [3,4,5] >>= \x -> [x,-x]
[3,-3,4,-4,5,-5]
Prelude> [] >>= \x -> ["bad","mad","rad"]
[]
```

在回顾一下`>>=`，接受一个有上下文的值以及一个接受一个普通值返回一个带上下文的值的函数。上面的结果很容易理解，只是将lamda函数map到每个元素，然后再用concat打平而已。非确定性还包括对失败的支持。`[]`就跟Nothing一样，表示没有结果。

把他们串起来使用：

```
Prelude> [1,2] >>= \n -> ['a','b'] >>= \ch -> return (n,ch)
[(1,'a'),(1,'b'),(2,'a'),(2,'b')]
```

```haskell
listOfTuples :: [(Int,Char)]  
listOfTuples = do  
    n <- [1,2]  
    ch <- ['a','b']  
    return (n,ch)
```

do形式的n和ch都是会取到数组里的每个值。 List comprehensions形式：

```
*Main>  [ (n,ch) | n <- [1,2], ch <- ['a','b'] ]
[(1,'a'),(1,'b'),(2,'a'),(2,'b')]
```

实际上 List comprehensions只是把List当作monad使用的语法糖，最终还是翻译到do中，用`>>=`来计算。这玩意还能在后面来个过滤操作：

```
*Main> [ x | x <- [1..50], '7' `elem` show x ]
[7,17,27,37,47]
```

要知道是怎么实现的，需要看一下`MonadPlus`这个类型类，

```haskell
class Monad m => MonadPlus m where  
    mzero :: m a  
    mplus :: m a -> m a -> m a
```

mzero对应于Monoid类型类的mempty， mplus 对应于mappend，Lists既是monoid又是monad

```haskell
instance MonadPlus [] where  
    mzero = []
    mplus = (++)
```

```haskell
guard :: (MonadPlus m) => Bool -> m ()  
guard True = return ()  
guard False = mzero
```

guard函数接受一个bool值，如果是True就将`()`丢到最小上下文中，否则就得到一个失败的结果。

```
ghci> guard (5 > 2) :: Maybe ()  
Just ()  
ghci> guard (1 > 2) :: Maybe ()  
Nothing  
ghci> guard (5 > 2) :: [()]  
[()]  
ghci> guard (1 > 2) :: [()]  
[] 
```

```
*Main> [1..50] >>= (\x -> guard ('7' `elem` show x) >> return x)
[7,17,27,37,47]
```

上面这样用的结果就跟List Comprehension一样了。guard这玩意是如何做到的呢？先看看他连接`>>`时：

`>>`的定义是下面这样的，最终也是`>>=`来计算了，只是他忽略输入，直接输出某结果，但是因为是用`>>=`来计算的，所以隐含了一条就是，如果输入是一个失败的值，那么最终的结果是失败的！因为failure连接`>>=`时结果总是failure。所以如果在guard为失败的结果的时候，最终的结果会是一个空数组。

```haskell
(>>) :: m a -> m b -> m b  
x >> y = x >>= \_ -> y
```

```
ghci> guard (5 > 2) >> return "cool" :: [String]  
["cool"]  
ghci> guard (1 > 2) >> return "cool" :: [String]  
[]
```

do的写法：

```haskell
sevensOnly :: [Int]  
sevensOnly = do  
    x <- [1..50]  
    guard ('7' `elem` show x)  
    return x
```

#### Monad laws

monad像Functor那样也有自己的实例必须遵守的规则。因为哪个玩意做了一个Monad类型类的索引，那并不意味着他就是monad，那只代码他是类型类的一个实例。所有才需要这些规则，这样才能让我们推测类型和他的行为。haskell允许任何类型成为monad的实例，但是不并不会自动去检查是否符合该遵守的这些规则。标准库的都是满足条件的，自己要做的话就得手动检查。

**Left identity**

>  `return x >>= f`和`f x`是一样的结果

```
ghci> return 3 >>= (\x -> Just (x+100000))  
Just 100003  
ghci> (\x -> Just (x+100000)) 3  
Just 100003
ghci> return "WoM" >>= (\x -> [x,x,x])  
["WoM","WoM","WoM"]  
ghci> (\x -> [x,x,x]) "WoM"  
["WoM","WoM","WoM"] 
```

**Right identity**

> `m >>= return` 的结果和`m`一样

这个从函数类型上来看也好理解，m是包含上下文的，return是接受的一个值，然后返回一个包含该值的最小上下文，这个表达式就相当于把m里的值拿出来丢进return，然后return再塞回去。

```
ghci> Just "move on up" >>= (\x -> return x)  
Just "move on up"  
ghci> [1,2,3,4] >>= (\x -> return x)  
[1,2,3,4]  
ghci> putStrLn "Wah!" >>= (\x -> return x)  
Wah!
```

**Associativity**

当有一串monadic函数用`>>=`连接的时候，那就不在乎他们如何嵌套，结果都是一样的：

>  `(m >>= f) >>= g`的结果和`m >>= (\x -> f x >>= g)`的结果一样

连接两个函数的是这样定义的：

```haskell
(.) :: (b -> c) -> (a -> b) -> (a -> c)  
f . g = (\x -> f (g x))  
```

如果这里的函数都是monadic，而参数都是monadic value呢？这个时候就可以用`<=<`：

```haskell
(<=<) :: (Monad m) => (b -> m c) -> (a -> m b) -> (a -> m c)  
f <=< g = (\x -> g x >>= f)  
```

```
ghci> let f x = [x,-x]  
ghci> let g x = [x*3,x*2]  
ghci> let h = f <=< g  
ghci> h 3  
[9,-9,6,-6]
```

那么如果用在这些规则上，`f <=< return`和`return <=< f`的结果是一样的，都是`f`。

### For a Few Monads More

#### Writer? I hardly know her!

Writer这个monad是一个类似log的东西，Writer允许我们进行计算，同时确保将所有日志值组合为一个日志值，然后将其附加到结果中。

```haskell
isBigGang x = x > 9  
isBigGang x = (x > 9, "Compared gang size to 9.")
```

第二个函数在返回比较结果的同时还伴随了一条log，即现在结果是加上了上下文的结果了。这时如果我们已经有一个带log的值，想要丢给isBigGang这个函数该怎么办呢？这是一个熟悉的问题，换句话说，要把一个带盒子的值，丢给一个只接受一个普通值的函数，该怎么办。

```haskell
applyLog :: (a,String) -> (a -> (b,String)) -> (b,String)  
applyLog (x,log) f = let (y,newLog) = f x in (y,log ++ newLog) 
```

可以构建一个上述函数，把值取出来执行函数的同时，也不丢掉之前的log信息。

```
*Main> (3, "Smallish gang.") `applyLog` isBigGang
(False,"Smallish gang.Compared gang size to 9.")
```

applyLog的log类型一定得是String吗？毫无疑问，也可以是List，`++`函数还可以沿用。那bytestrings呢？那是不是得分开来再写一个对应于bytestrings的函数？这里纠结的点其实就是`++`函数，而考虑到bytestrings和list都是monoid，那么他们就都有mappend函数，那么把`++`函数换成mappend函数就能应用所有的monoid了啦。

```haskell
applyLog :: (Monoid m) => (a,m) -> (a -> (b,m)) -> (b,m)  
applyLog (x,log) f = let (y,newLog) = f x in (y,log `mappend` newLog) 
```

现在我们不用再把这个tuple想象成一个值加一条log的组合，可以想象成一个值加上一个伴随着的monoid值。

```haskell
import Data.Monoid 

type Food = String
type Price = Sum Int

addDrink :: Food -> (Food, Price)
addDrink "beans" = ("milk", Sum 25)
addDrink "jerky" = ("whiskey", Sum 99)
addDrink _ = ("beer", Sum 30)
```

这里的tuple第一个值表示item名，另一个用monoid来表示价格。当吃beans的时候并且要了饮料的时候就把总的价格返回。

```haskell
*Main> ("beans", Sum 10) `applyLog` addDrink
("milk",Sum {getSum = 35})
```

#### writer

说了这么多终于到了主角Writer了，定义很简单，为了在实现Monad的时候区别于普通的tuple，这里用了newtype重新包裹了一下。看过之前的applyLog的实现后，这里的Monad实现也很好理解。

```haskell
newtype Writer w a = Writer { runWriter :: (a, w) } 

instance (Monoid w) => Monad (Writer w) where  
    return x = Writer (x, mempty)  
    (Writer (x,v)) >>= f = let (Writer (y, v')) = f x in Writer (y, v `mappend` v') 
```

w被限制为一个Monoid，所以w是实现了mempty和mappend函数的，回顾下mempty，表示最小上下文，当a和mempty进行mappend的时候结果一定要是a。比如数组的mempty就是空数组。

```
*Main Data.Monoid> mempty :: [a]
[]
*Main Data.Monoid> mempty :: String
""
```

所以当执行return的时候会根据限定的类型来返回对应的值：

```
Prelude Control.Monad.Writer> runWriter (return 3 :: Writer String Int)
(3,"")
Prelude Control.Monad.Writer> runWriter (return 3 :: Writer (Sum Int) Int)
(3,Sum {getSum = 0})
```

#### Using do notation with Writer

```haskell
import Control.Monad.Writer  
  
logNumber :: Int -> Writer [String] Int
logNumber x = writer (x, ["Got number: " ++ show x])

multWithLog = do
  a <- logNumber 3
  b <- logNumber 5
  tell ["Gonna multiply these two"]
  return (a * b)
```

```
*Main Control.Monad.Writer> runWriter multWithLog
(15,["Got number: 3","Got number: 5","Gonna multiply these two"])
```

这里用到了tell，用来在特定的地方把某些monoid包含进去，要注意的时候，这里的tell的结果是返回的()外加一个monoid，所以如果tell放最后的话，那么log信息还在，但是因为do的最后一行是整段代码的结果，而tell的结果是()，也就是说tell放最后的话，`a*b`的结果就丢失了，只是log信息还在而已。

因此tell像是能当其他语言的print一样的来在打日志调试。

