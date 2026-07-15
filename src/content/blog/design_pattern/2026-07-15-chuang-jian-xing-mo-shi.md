# 创建型模式



## 单例模式

单例模式的含义很好理解，确保应用程序中某个类有且只有一个实例的时候，提供一个全局的唯一访问点，考虑使用单例模式。

### 全局单例对象

如果想实现一个程序中的单例，最简单的就是用static创建一个全局的对象。

```cpp
static Database database{};
```

> 全局 static 对象知识点
> 
> 对于全局 static 对象，其创建时间在 main 之前，并且全局 static 对象具有内部链接性，即只在 cpp 单元中可见，不同单元中可以存在不同的全局static对象。

不同单元都可以有全局static对象，这就引出了一个问题：当不同单元都有全局static对象时，全局static对象相互之间的初始化顺序是不确定的。这便是全局单例对象的弊端。



### 局部静态变量

> 局部 static 对象知识点
> 
> 知识点1：对于局部 static 对象，它是有一个特性的，即延迟初始化。指的是，对于局部 static 对象的创建时机是在其被调用的时候的（那必然是在main之后了）
> 
> 知识点2：在c++11之后，编译器能够保证局部static对象的初始化是线程安全的（如果没有这个保护，那么会出现多个线程同时第一次执行到局部static的位置，导致出现竞态条件）

现在我们用局部静态变量的优势来实现单例模式，由于局部static对象有延迟初始化的特性，于是初始化顺序不确定的问题就被解决了。

下面给出使用局部静态变量实现单例模式的例子：

```cpp
class Singleton {
public:
  static Singleton& instance() {
    static Singleton obj;
    return obj;
  }
  
  Singleton(const Singleton&) = delete;
  Singleton(Singleton&&) = delete;
  Singleton& operator=(const Singleton&) = delete;
  Singleton& operator=(Singleton&&) = delete;

private:
  Singleton() = default;
  ~Singleton() = default;
};
```

来看看使用局部静态变量实现的单例模式的几个优点：首先就是解决初始化顺序不确定的问题，现在只需要使用 `Singleton.instance()` 就可以了（如果在调用时没初始化会去初始化），其次线程安全，其次就是这是一种“懒汉式”创建，在使用的时候才创建，而不是无论用于不用都在内存放一份创建的对象。

> 说一说单例模式创建的一些其它小tips：
> 1. 我们禁用拷贝与移动操作，彻底杜绝副本的产生
> 2. 我们在创建单例的时候，也可以使用 new 让对象分配在堆上。虽然其析构函数永远不会被调用，但是在程序退出时操作系统会回收这部分物理内存，所以不会造成内存泄漏。



> 好处说完了，坏处呢？

### 单例模式的强耦合问题

单例的对象容易被硬编码引用，导致测试时Mock受阻、强耦合，比如这样：

```cpp
class UserService
{
public:
    void login()
    {
        Logger::instance().log("login");
    }
};
```

如果后续我们要测试 UserService 的功能时，也没办法替换掉真实的 Logger::instance() 实例，这里出现了强耦合。

解决办法是控制反转，让业务不直接依赖单例对象，单例的特性由传入的对象来保证，具体看例子，以上的业务逻辑 UserService 可以改动为：

```cpp
class UserService
{
public:

    UserService(ILogger& logger)
        : logger_(logger)
    {
    }

    void login()
    {
        logger_.log("login"); // 不直接依赖单例对象，而是通过控制反转的方式注入
    }

private:
    ILogger& logger_;
};
```

此时这里的单例特性由传入 UserService 的构造函数的参数来保证。



### 配合控制反转IoC的单例模式

再进一步，类普通，生命周期的管理交给控制反转容器。

比如上述的UserService的logger实际注入这个动作交给控制反转容器，由它来管理生命周期问题，UserService只要关注自己的业务逻辑即可。