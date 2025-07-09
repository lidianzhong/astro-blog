# 第一个C++程序

我们来编写第一个C++程序。

打开文本编辑器，输入以下代码：

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, world!" << std::endl;
    return 0;
}
```

在一个C++程序中，你总能找到一个类似：

```cpp
int main() {
    ...
}
```

的定义，这个定义被称为主函数（main function），程序从这里开始执行。`int`表示主函数返回一个整数，`main`是函数名，圆括号`()`中可以包含参数，这里暂时为空。花括号`{}`中间则是主函数的具体实现。

注意到主函数中，我们使用了如下语句输出内容：

```cpp
std::cout << "Hello, world!" << std::endl;
```
