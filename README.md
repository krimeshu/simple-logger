# Simple Logger

> Version: 2.0

## 说明

移动端调试页面时的小工具，在页面最顶部的脚本前引用（`head`中也可），即可监听脚本中对于的`window.console`对象相关方法的调用，
将相关信息输出到页面内。通过点击屏幕上出现的黑色悬浮按键，即可呼出控制台信息记录进行查看。（悬浮按键可被拖动，以防调试时遮挡
页面元素）

实现了Chrome下`console`对象大部分方法的模拟，包括`log, warn, info, error`等，并可以使用`%`型的格式控制（可使用%%, %c, %d或i, %f, %s, %o, %O）。

对浏览器全局错误事件也进行了监听，脚本出错时能跟踪到文件及代码行号，将相关错误信息通过`error`型信息输出到控制台供查看。

具体效果可参考`index.html`。

![效果图](/Moonshell/simple-logger/blob/master/img/simple-logger.png?raw=true)

## 附：

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
