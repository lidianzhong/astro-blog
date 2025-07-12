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