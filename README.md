# simple-logger

移动端调试页面时的小工具，在页面最顶部的脚本前引用（`head`中也可），后续脚本的`console.log`即可被替换成
`SimpleLogger.log`来记录日志了。

目前尚未提供`warn`, `error`等函数处理，格式化控制也有点不一样，使用`{index}`来处理参数，例子：

```js
    console.log('Hello, {1}! Current time is {2}`, 'Jim', new Date().toLocalString());
```

页面上会出现一个黑色小框，点击后即可展开查看日志记录。长按它还可以拖拽移动到其他位置，防止遮挡页面元素。

> 2015.5.14 更新：

正式环境下屏蔽呼出按键的方式，只需要在引入js文件后，判断环境再调用`SimpleLogger.hideBtn()`即可，例子：

```html
<!DOCTYPE html>
<head>
    <meta charset="utf-8"/>
    <title>示例</title>
    <script src="js/simple-logger.js"></script>
    <script>
        if (window.location.host != 'testhost') {
            console.hideBtn();
        }
    </script>
```

（可作为防止发布正式环境时忘撤js文件的备选方案，当然，能做到的话，还是在正式环境的html中排除调试用的js文件比较好）
