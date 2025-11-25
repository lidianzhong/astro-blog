# 调用追踪上下文指针

当我们想知道在程序执行过程中，函数调用链路的机制，或者想分析程序代码的性能瓶颈，我们往往会通过在程序入口处记录一下，比如 “开始调用了，当前时间戳是 xxx”、 “结束调用了，当前时间戳是 xxx” 来看看程序执行的步骤和当前函数执行的时间。

为了更优雅的实现这个机制，我们可以在每次函数调用时，将当前上下文信息（如函数名、调用时间、调用者等）记录下来，并在函数退出时清除或更新该信息。作用就是一个主要用于调试的手段吧。

这里用了一个简单示例来演示使用栈来完成这样的追踪调用过程

```cpp
#include <iostream>
#include <stack>
#include <string>
#include <chrono>

// 线程局部调用栈
thread_local std::stack<std::string> call_stack;

class CallContext {
public:
    CallContext(const std::string& name) {
        call_stack.push(name);
        print_stack("Enter");
    }

    ~CallContext() {
        print_stack("Exit");
        call_stack.pop();
    }

private:
    void print_stack(const std::string& phase) {
        // ... 遍历栈, 打印调用链 ...
           // print(func_name, full_stack);
    }
};

void foo() {
    CallContext ctx("foo");
    bar();
}

void bar() {
    CallContext ctx("bar");
}

int main() {
    CallContext ctx("main");
    foo();
    return 0;
}

```

执行上方代码可以得到结果。由于在每个函数执行时，都往里面记录了当前函数的名称（"Enter"或"Exit"），然后打印栈信息，而栈又包括了链路信息，这样就可以知道执行到当前函数时的“调用链”。

```powershell
[Enter] main -> ...
[Enter] main -> foo -> ...
[Enter] main -> foo -> bar -> ...
[Exit] main -> foo -> bar -> ...
[Exit] main -> foo -> ...
[Exit] main -> ...

```