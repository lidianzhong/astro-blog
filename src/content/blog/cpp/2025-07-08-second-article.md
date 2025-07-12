# 第一个C++程序

我们来编写第一个C++程序。

打开文本编辑器，输入以下代码：

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

// 1. 命名空间
namespace MyNS {
    int value = 10;
}

// 2. 类和继承
class Base {
public:
    virtual void show() { std::cout << "Base\n"; }
    virtual ~Base() {}
};

class Derived : public Base {
public:
    void show() override { std::cout << "Derived\n"; }
};

// 3. 模板函数
template <typename T>
T max(T a, T b) { return a > b ? a : b; }

// 4. 函数对象
struct Adder {
    int operator()(int a, int b) { return a + b; }
};

int main() {
    // 5. 使用命名空间
    std::cout << MyNS::value << "\n";

    // 6. 多态
    Base* b = new Derived();
    b->show();
    delete b;

    // 7. 模板实例化
    std::cout << max(3, 5) << "\n";

    // 8. STL容器和算法
    std::vector<int> v = {3, 1, 4};
    std::sort(v.begin(), v.end());

    // 9. Lambda表达式
    auto print = [](int n) { std::cout << n << " "; };
    std::for_each(v.begin(), v.end(), print);

    // 10. 智能指针
    auto ptr = std::make_unique<int>(42);

    // 11. 类型推断
    auto x = 3.14;

    return 0;
}
```

```python
from flask import Flask
from flask import request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    return '<h1>Home</h1>'

@app.route('/signin', methods=['GET'])
def signin_form():
    return '''<form action="/signin" method="post">
              <p><input name="username"></p>
              <p><input name="password" type="password"></p>
              <p><button type="submit">Sign In</button></p>
              </form>'''

@app.route('/signin', methods=['POST'])
def signin():
    # 需要从request对象读取表单内容：
    if request.form['username']=='admin' and request.form['password']=='password':
        return '<h3>Hello, admin!</h3>'
    return '<h3>Bad username or password.</h3>'

if __name__ == '__main__':
    app.run()

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
