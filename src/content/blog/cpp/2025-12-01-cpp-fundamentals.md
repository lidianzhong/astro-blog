# C++ 基础知识

## 拷贝构造和移动构造

拷贝构造用来复制一个对象的内容（原来对象还在使用），移动构造用来转移一个对象的内容（移动后的原来对象不能使用了）。

### 拷贝构造函数调用的时机
1. 已经有一个对象了，想用这个创建另外一个新对象，有显式初始化和隐式初始化

```cpp
MyClass obj1;
MyClass obj2(obj1); // 用已经存在的对象显式创建新的对象

MyClass obj1;
MyClass obj3 = obj1; // 隐式初始化的形式，这里不是 move 操作
```
2. 或者以值传递的方式传递对象和以值方式的函数返回，都会调用拷贝构造函数（如果对象不能移动的话，也不被RVO 优化的话）

```cpp
void func(MyClass param) {
    // param 是传入对象的副本
}

MyClass obj;
func(obj); // 调用拷贝构造函数，将 obj 拷贝到 param


MyClass createObject() {
    MyClass localObj;
    return localObj; // 可能会发生拷贝构造/移动构造 (或被 RVO 优化)
}

MyClass obj4 = createObject();
```

### 移动构造函数调用的时机
1. 你用右值去初始化一个新对象

```cpp
MyClass createTemp(); // 假设这个函数返回一个对象

MyClass obj5 = createTemp(); // createTemp() 返回一个右值，调用移动构造函数 (如果 RVO/NRVO 未生效)

MyClass obj6;
MyClass obj7 = std::move(obj6); // 使用 std::move() 将 obj6 强制转换为右值，调用移动构造函数
```
2. 以值方式的函数返回，可能会触发移动构造（如果这个对象能被移动的话）