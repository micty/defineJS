
defineJS 框架
==============================================================
--------------------------------------------------------------

###简介 

defineJS 是一个轻量级的 JavaScript 框架，可以用它来定义 CMD 模式的 JS 模块，多个 CMD 模块可以组成一棵模块树。
处于树节点中的模块只能加载到它的直接子节点模块，而不能跨级调用，从而把模块与模块之间复杂的网状结构变成树型结构，降低耦合度，提高模块的可维护性。


在目录 `modules` 增加一个模块：`User.js`

```js
define('User', function (require, module, exports) {

	var Login = module.require('Login');
    
    
    return {
    	login: function () {
        	Login.post();
        },
    };
    

});
```

在目录 `modules/User` 增加一个模块：`Login.js`

```js
define('User/Login', function (require, module, exports) {

	return {
    	post: function () {
        	console.log(module.id, 'post called!');
        },
    };

});
```

在根目录增加一个启动模块 `index.js`

```js

var $ = require('defineJS');

$.config({
    'base': __dirname,
    'modules': [
        'modules/',
    ],
});

$.launch(function (require, module, exports) {
    
    var User = require('User');
    User.login();

});

```





> 在前端领域中，对 JS 模块的管理，有很多优秀的框架和库，比如 Seajs，就可以很方便的管理多个 JS 模块。




#JS 模块
在前端开发领域，一个模块，可以是JS 模块，也可以是 CSS 模块，或是 Template 等模块。**在这里，我们专注于 JS 模块。**
JS 模块具有如下特征：
- 模块是一段 JavaScript 代码，具有统一的基本书写格式。
- 模块之间通过基本交互规则，能彼此引用，协同工作。

把上面两点中提及的基本书写格式和基本交互规则描述清楚，就能构建出一个模块系统。

#CMD 模块
我们把遵循 CMD 模式的 JS 模块称为 CMD 模块。CMD 是 `Common Module Definition` 的缩写，CMD 模块具有以下规范：
 - 一个模块就是一个文件。
 - 模块的功能要简单，职责要单一。
 - 模块定义通过 `define` 函数实现。
 - 模块加载通过 `require` 函数实现。
 - 模块定义里的工厂函数通过 `module.exports` 或 `return` 导出模块。
 - 模块加载用同步的方式 `var module = require(‘…’);`。

#网状结构
当我们用 CMD 模式定义一组模块后，在应用程序中就形成了一个模块系统，而模块系统中的任意一个模块都可以调用另一个模块。换而言之，模块系统中的模块是不具有可访问性控制的，所有模块都成了公共模块，所有的模块都可以被其它模块调用，而且还无法获知调用方是哪个模块。从调用关系来看，它们形成了一个网状结构，网状结构会带来很多维护上的麻烦和风险，因为模块与模块之间产生了紧耦合。

##网状结构的问题
 - 模块与模块之间互相依赖和引用，深深的耦合在一起。
 - 随着模块的增加，系统越来越复杂，不利于扩展。
 - 模块的依赖和管理变得非常困难，可能会导致循环依赖和引用而发生死锁。
 - 牵一发而动全身，想移除一个模块而不影响其他模块将变得非常困难，成为一场噩梦。

#中介者模式
- 中介者模式促成松耦合，提高了可维护性。
- 对象之间无法互相看到对方的存在，就像对方是完全透明的，更不能直接通信。
- 一个对象仅能看到自己内部的成员和状态，当状态发生改变后，如果想传达给外界，则通过消息（事件）机制通知中介者，由中介者去调用其他对象的成员方法。
- 消息的触发，只能由对象自身去完成，外界只能监听该消息。

##中介者模式的模块系统
- 模块与模块之间互相独立，互不依赖和引用
- 模块内部维护自身的状态的正确性
- 模块内部的事件只能由模块自身触发
- 模块暴露接口给外界(控制器)监听模块事件
- 模块暴露必要接口给外界(控制器)调用
- 所有模块对控制器可见
- 在控制器里绑定模块与模块之间的事件监听

##中介者模式下的模块划分
- 模块要足够简单，功能要单一。
- 一个模块单独成一个文件，文件内只能有模块定义(define)调用，而不能有其它逻辑。
- 兄弟模块之间互不可见，互不引用和依赖。
- 父模块充当直接子模块的控制器(中介者)，不属于自己的直接子模块不可见。
- 模块的命名采用目录层级形式，如A/B/C，且在父模块所在的目录建立同名的目录名，直接子模块放入其内。
- 当一个模块开始变得复杂时，可采用递归和分而治之的方式进一步划分成控制器和直接子模块

 ** 一个中介者模块组就形成一个树干，当我们把一组中介者模式的模块组组合起来，就形成一棵完整的模块树，即树型结构的 CMD 模块系统。 **
 

#树型结构的 CMD 模块系统
---------------------------------------------------------------------------------------------

###模块的定义与加载

defineJS 框架提供了 CMD 模块的定义与加载能力，业务层可以很方便的定义一个 CMD 模块，并在其它模块加载它。 如：

``` javascript

/**
* 定义一个公共模块: User
*/
define('User', function (require, module, exports) {
    
    //相当于 require('User/Login');
    //加载当前模块的直接子模块，只能用短名称方式
    var Login = module.require('Login'); 

});


/**
* 定义一个私有模块: Login，使它属于 User 的子模块。
*/
define('User/Login', function (require, module, exports) {

    return {
        //要暴露的接口和字段
    };

});
```

####模块树

我们推荐使用具有树型层级关系的模块系统，这样带来的好处是，模块与模块之间的依赖不再是一个复杂的网状结构，而是一个具有上下级关系的树形结构，从而使模块之间的关系更简单，依赖和管理也更可控。

树形结构的模块系统
我们使用具名的模块定义方式，即在定义模块时，`第一个参数`(字符串)即为模块的`名称`(`id`)。模块名称中，我们使用熟悉的`路径系统`的表示方式来表示出模块之间的父子关系，具体举例：

- `User`
- `User/Login`
- `User/Login/API`
- `User/Login/Loading`
- `User/List`
- `User/List/Scroller`
- `User/List/Template`

从层级上可以看出，

- `User` 模块的直接子模块：`Login` 和 `List`。
- `Login`模块的直接子模块：`API`和`Loading`。
- `List`模块的直接子模块：`Scroller`和`Template`。

从 JSON 的角度来看，它们更像：

``` json
{
    "User": {
        "Login": [
	        "API", 
	        "Loading"
        ],
        "List": [
	        "Scoller", 
	        "Template"
        ],
    }
}
```

通过这种路径的表示方式，我们可以构造出一棵模块树。 在上面的例子中，树的根节点是 `User`。

###模块树下的模块加载约束
我们建造这棵模块树的初衷：把模块之间的复杂的网状关系变成具有上下级关系的树形结构。在框架上，我们也做了强约束，模块与模块之间的加载与可见性要遵守一定的约束，总的来说：**一个模块只能加载对它可见的模块**。具体为：
- 兄弟模块之间互相不可见，从而互相不能加载对方，就如同它们互相不知道对方的存在一样，从而保证模块的独立性。
- 子模块仅对直接父模块可见，从而 **有且仅有** 直接父模块可以加载它们。换言之，一个模块只能加载自己的直接子模块，连孙子模块也不能加载。
- 当一个模块开始变得复杂时，可采用递归和分而治之的方式进一步划分成父模块和直接子模块。

对于上面的例子：在 `User` 模块里，它的直接子模块为 `Login` 和 `List`。 要加载它们，只能在 `User` 模块的工厂函数里：

``` javascript

define('User', function (require, module, exports) {
    //短名称方式：正确的方式
    var Login = module.require('Login'); 
    var List = module.require('List');
});

``` 

而不能用长名称方式

``` javascript

define('User', function (require, module, exports) {
    //长名称方式：会抛出异常
    var Login = require('User/Login');
    var List = require('User/List');
});

``` 
一个模块只能加载它的直接子模块，而不能跨级加载，例如，如果 `User` 模块加载孙子模块则会报错：
``` javascript

define('User', function (require, module, exports) {
    //加载不属于自己的直接子模块：会抛出异常
    var API = require('Login/API');
    var Scoller = require('List/Scoller');
});

``` 
反过来也一样，子模块不能加载父模块：

``` javascript

define('User/Login/API', function (require, module, exports) {
    //子模块加载父模块：会抛出异常
    var Login = require('User/Login');
   
});

``` 

因为长名称方式无法检测一个模块与被加载模块之间的直接父子关系，从而无法确保上述的强约束。


**注意**：私有模块以 `/` 开头，公共模块则不需要。

**原则**：优先使用私有模块，尽量减少公共模块的定义和使用。 因为公共模块会给很多别的模块引用，对公共模块的改动将会对依赖于它的其它模块产生很大影响，从而带来维护上的困难。使用私有模块则不会有该问题。




#相比于 Seajs 的创新之处

 - 增加了模块的可见性约束，让整个模块系统形成一棵模块树，避免了网状结构的引用和依赖方式。
 - 强行使用具名的模块定义方式，解除绑定模块路径与名称的关系，也消除了模块位置发生变化时带来的一连串依赖改动。
 - 增加了父模块加载子模块的约束方式，简化了长命名的加载方案。
 - 模块与模块的逻辑关系仅通过名称即可限定，有效解决了模块之间的复杂的依赖关系。
 - 可以很好的使用事件驱动的方式进行模块之间的通信，从而解除耦合。


---------------------------------------------------------------------------------------------





