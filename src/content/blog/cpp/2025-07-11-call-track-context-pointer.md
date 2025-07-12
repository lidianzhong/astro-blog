# 调用追踪上下文指针

当我们想知道在程序执行过程中，函数调用链路的机制，或者想分析程序代码的性能瓶颈，我们往往会通过在程序入口处记录一下，比如 “开始调用了，当前时间戳是 xxx”、 “结束调用了，当前时间戳是 xxx” 来看看程序执行的步骤和当前函数执行的时间。为了更优雅的实现这个，我们可以**在每次函数调用时，将当前上下文信息（如函数名、调用时间、调用者等）记录下来，并在函数退出时清除或更新该信息**。作用就是一个主要用于调试的手段吧。



这里用了一个简单示例来演示使用栈来完成这样的追踪调用过程

```java
/**
 * 可以用来自动创建文档的注释
 */
public class Hello {
    public static void main(String[] args) {
        // 向屏幕输出文本:
        System.out.println("Hello, world!");
        /* 多行注释开始
        注释内容
        注释结束 */
    }
} // class定义结束

```

```cpp
#include <iostream>
#include <stack>
#include <string>
#include <chrono>
#include <thread>
#include <mutex>

// 线程局部调用栈
thread_local std::stack<std::string> call_stack;

class CallContext {
public:
    CallContext(const std::string& name) : func_name(name), start(std::chrono::high_resolution_clock::now()) {
        call_stack.push(func_name); // 将信息记录到栈中
        printStack("Enter");
    }

    ~CallContext() {
        printStack("Exit");
        call_stack.pop(); // 将信息记录从栈中弹出
    }

private:
    std::string func_name;
    std::chrono::high_resolution_clock::time_point start;

    // 从头到尾打印一下栈信息，比如：[Enter] main -> foo -> ...
    void printStack(const std::string& phase) {
        std::cout << "[" << phase << "] ";
        std::stack<std::string> temp = call_stack;
        std::vector<std::string> trace;
        while (!temp.empty()) {
            trace.push_back(temp.top());
            temp.pop();
        }
        std::reverse(trace.begin(), trace.end());
        for (const auto& name : trace) {
            std::cout << name << " -> ";
        }
        std::cout << "..." << std::endl;
    }
};

void foo();
void bar();

void foo() {
    CallContext ctx("foo");
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    bar();
}

void bar() {
    CallContext ctx("bar");
    std::this_thread::sleep_for(std::chrono::milliseconds(50));
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

