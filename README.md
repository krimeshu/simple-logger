# simple-logger

移动端调试页面时的小工具，在页面最顶部的脚本前引用（`head`中也可），后续脚本的`console.log`即可被替换成
`SimpleLoger.log`来记录日志了。

目前尚未提供`warn`, `error`等函数处理，格式化控制也有点不一样，使用`{index}`来处理参数，例子：

```js
console.log('Hello, {1}! Current time is {2}`, 'Jim', new Date().toLocalString());
```

页面上会出现一个黑色小框，点击后即可展开查看日志记录。长按它还可以拖拽移动到其他位置，防止遮挡页面元素。
