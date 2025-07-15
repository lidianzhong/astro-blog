---
title: "自定义 Vector 实现"
published: 2025-03-28
lastmod: 2025-03-28
category: "C++"
tags: ["C++", "STL"]
description: '参考 STL 源码, 实现 vector 自定义动态数组'

weight: 1
draft: false # 是否为草稿
comments: true # 本页面是否显示评论
reward: false # 打赏
mermaid: true #是否开启mermaid
showToc: true # 显示目录
TocOpen: false # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: false #顶部显示路径
cover:
  image: "" #图片路径例如：posts/tech/123/123.png
  zoom: # 图片大小，例如填写 50% 表示原图像的一半大小
  caption: "" #图片底部描述
  alt: ""
  relative: false
---

# 自定义简化版 Vector 实现

## 实现基础功能

类成员变量：

```cpp
template <class T>
class vector {
public:
	using value_type = T;
	using size_type = std::size_t;
	using difference_type = std::ptrdiff_t;
	using reference = value_type&;
	using const_reference = const value_type&;
	using iterator = value_type*;
	using const_iterator = const value_type*;


private:
	T* m_start;
	T* m_finish;
	T* m_end_of_storage;

```



### 构造函数

首先实现默认构造函数，初始时让三个指针都指向空。然后实现的是带有初始大小和初始值的构造函数。

```cpp
vector()
    : m_start(nullptr), m_finish(nullptr), m_end_of_storage(nullptr) {} // 无参构造函数

vector(size_type n, const value_type& val = value_type()) {
    m_start = allocate(n);
    std::uninitialized_fill_n(m_start, n, val);
    m_finish = m_end_of_storage = m_start + n;
}
```

带有参数的构造函数接收两个值：初始大小、初始值。使用 `allocate(n)` 分配了内存，不构造对象。然后使用 `std::uninitialized_fill_n` 构造对象，使用这个而不是`fill_n`的原因是 m_start 未初始化，不会调用其析构函数，更加安全。



### 析构函数

```cpp
~vector() {
    std::destroy(begin(), end());
    deallocate(m_start);
}
```

析构函数做了两件事：1. 使用 destroy 调用每个对象的析构函数，以回收它们的空间，2.使用deallocate回收在构造函数中分配的内存。



### 添加元素

```cpp
void push_back(const value_type& val) {
    if (m_finish != m_end_of_storage) {
        std::construct_at(m_finish, val);
        ++m_finish;
    } else {
        size_type new_size = std::max(2 * size(), size() + 1);
        iterator new_start = allocate(new_size);
        iterator new_finish = std::uninitialized_move(m_start, m_finish, new_start);
        std::construct_at(new_finish, val);
        ++new_finish;
        std::destroy(begin(), end());
        deallocate(m_start);
        m_start = new_start;
        m_finish = new_finish;
        m_end_of_storage = m_start + new_size;
    }
}
```

添加元素的代码逻辑是：如果空间未满（m_finish 和 m_end_of_storage不相同），那么构造一个 val 值放到 m_finish 处，然后再将 m_finish 往后移动一格，就可以了。如果空间满了，就要进行扩容操作，扩容的依据是扩容成两倍，这里的 std::max(2 * size(), size() + 1); 逻辑是从 insert 函数继承过来的。在将旧空间的数据移动到新空间时，使用的是 uninitialized_move，使用的原因有两个：1. 新空间还没有分配对象，所以使用 ”uninitialized“ 的，其次，是移动赋值即可，因为之前的空间后边还要回收的，以后用不到了，所以用的是 move 而不是 copy。



### 访问元素

```cpp
reference operator[] (size_type n) {
    return *(begin() + n);
}

const_reference operator[] (size_type n) const {
    return *(begin() + n);
}

reference at(size_type n) {
    if (n >= size()) {
        throw std::out_of_range("Index out of range");
    }
    return *(begin() + n);
}

const_reference at(size_type n) const {
    if (n >= size()) {
        throw std::out_of_range("Index out of range");
    }
    return *(begin() + n);
}
```

访问元素的实现逻辑为将指针往后移动n位，然后取出对应的元素。使用 [] 不对范围进行检查，效率更高些，但是没有 at 安全，反之亦然。



### 获取大小

```cpp
size_type size() const {
    return m_finish - m_start;
}
```

因为 vector 的迭代器类型为随机存储迭代器，所以可以使用 m_finish - m_start 而无需使用效率更低的 std::distance(first, last);

 

### 判空

```cpp
bool empty() const {
    return begin() == end();
}
```

如果开始指针和结尾指针相同，那么为空。



### 清空数组

```cpp
void clear() {
    std::destroy(begin(), end());
    m_finish = m_start;
}
```

先调用迭代器指针指向的对象的析构函数，然后让 m_finish = m_start，这样做并不会回收空间。



### 删除元素

```cpp
iterator erase(iterator pos) {
    std::move(pos + 1, m_finish, pos);
    std::destroy_at(m_finish - 1);
    m_finish -= 1;
    return pos + 1;
}
```

删除元素的逻辑是将pos后边的元素往前移动一格，同时 m_finish 减一。这里因为空间是已经创建过的，所以使用 move 而不是 ”uninitialized“，其次移动元素是从右往左，所以不选用使用 “move_backward”。



### 插入元素

```cpp
iterator insert(iterator pos, const value_type& val) {
    if (m_finish != m_end_of_storage) {
        if (pos != m_finish) {
            std::construct_at(m_finish, *(m_finish - 1));
            std::move_backward(pos, m_finish - 1, m_finish);
            *pos = val;
            ++m_finish;
            return pos;
        } else {
            std::construct_at(m_finish, val);
            ++m_finish;
            return pos;
        }
    } else {
        size_type new_size = std::max(2 * size(), size() + 1);
        iterator new_start = allocate(new_size);
        iterator new_finish = std::uninitialized_move(m_start, pos, new_start);
        iterator ret = new_finish;
        std::construct_at(new_finish, val);
        ++new_finish;
        new_finish = std::uninitialized_move(pos, m_finish, new_finish);
        std::destroy(begin(), end());
        deallocate(m_start);
        m_start = new_start;
        m_finish = new_finish;
        m_end_of_storage = m_start + new_size;
        return ret;
    }
}
```

代码逻辑为：

- 如果 vector 不需要扩容
  - 如果插入不是在末尾
    - 将 m_finish 构造一个值为 *(m_finish - 1) 的对象
    - 使用移动赋值 move 来移动 pos 到 m_finish -  1区间的元素
    - 将 pos 处的元素赋值为 val
    - ++ m_finish， 返回 pos
  - 如果插入在结尾
    - 在末尾处 m_finish 构造一个值为 val 的元素
    - ++ m_finish， 返回 pos
- 如果 vector 已经满了，需要扩容
  - 申请 new_size = 2 * size()大小的空间
  - 将原来地方的数据搬过来，因为新内容是没有分配对象的，所以需要使用 ”uninitialized_move“ ，移动 m_start 到 pos 的元素
  - 在new_finish 的地方构造值为 val 的元素，++ m_finish
  -  将 pos 到 m_finish 的元素搬过来
  - 元素移动完成，使用destroy调用原所有对象的析构函数确保不要发生内存泄漏
  - 使用 deallocate 回收数组内存
  - 修改 m_start、m_finish、m_end_of_storage 的位置，返回原先的 new_finish



### 迭代器支持

```cpp
reference front() {
    return *begin();
}

reference back() {
    return *(end() - 1);
}

T* data() {
    return begin();
}

iterator begin() {
    return m_start;
}

iterator end() {
    return m_finish;
}
```

通过利用指针特性，能够完成遍历的功能，可以用于插入、排序等：

```cpp
TEST(VectorTest, Iterator) {
    Vector vec(3, "0");
    auto it = vec.insert(vec.begin() + 1, "15");
    EXPECT_EQ(*it, "15");
    std::sort(vec.begin(), vec.end());
}
```





## 移动语义支持

```cpp
// 移动构造
vector(vector&& other) noexcept {
    m_start = other.m_start;
    m_finish = other.m_finish;
    m_end_of_storage = other.m_end_of_storage;
    other.m_start = other.m_finish = other.m_end_of_storage = nullptr;
}

// 移动赋值
vector& operator=(vector&& other) noexcept {
    if (this == &other) {
        return *this;
    }
    destroy(begin(), end());
    deallocate(m_start, capacity());
    m_start = other.m_start;
    m_finish = other.m_finish;
    m_end_of_storage = other.m_end_of_storage;
    other.m_start = other.m_finish = other.m_end_of_storage = 0;
    return *this;
}

// 支持传入右值 插入
iterator insert(iterator pos, value_type&& val) {}

// 支持传入右值 push_back
void push_back(value_type&& val) {}
```



## 自动缩小容量

```cpp
bool should_shrink() const {
    return size() > 0 && size() < capacity() / 4;  // trigger: 25% capacity
}

void shrink_to_fit() {
    if (!should_shrink()) return;

    size_type new_capacity = std::max(size() * 2, size_type(1));  // at least 1
    T* new_start = allocate(new_capacity);
    T* new_finish = std::uninitialized_move(m_start, m_finish, new_start);

    destroy(m_start, m_finish);
    deallocate(m_start, capacity());

    m_start = new_start;
    m_finish = new_finish;
    m_end_of_storage = m_start + new_capacity;
}
```

当发现容量小于25%时，将容量进行缩小。容量检查被用于所有可能让 size() 缩小的函数中。



## 异常安全性

```cpp
try {
    new_finish = std::uninitialized_move(m_start, m_finish, new_start);
    std::construct_at(new_finish, std::move(val));
    ++new_finish;
} catch (...) {
    std::destroy(new_start, new_finish);
    deallocate(new_start);
    throw;
}
```

在 vector 类中的多处使用了类似于以上的错误捕获机制，能够实现在构造函数异常时，能够恢复到正常状态。通过验证，可以发现在构造函数异常时可以实现回滚

```cpp
TEST(VectorTest, ExceptionSafety) {
    King::vector<ThrowOnCopy> vec;
    vec.reserve(2);
    
    vec.push_back(ThrowOnCopy());  // 成功插入一个元素
    EXPECT_EQ(vec.size(), 1);
    
    // 尝试插入第二个元素（抛出异常）
    ThrowOnCopy obj;
    EXPECT_THROW(vec.push_back(obj), std::runtime_error);
    EXPECT_EQ(vec.size(), 1);  // 容器状态回滚
}
```



## 自定义分配器

```cpp
template <typename T>
class MyAllocator {
public:
	...

	pointer allocate(size_type n) {
		if (n > max_size()) {
			throw std::bad_alloc();
		}
		return static_cast<pointer>(::operator new(n * sizeof(T)));
	}

	void deallocate(pointer p, size_type n) noexcept {
		::operator delete(p);
	}

	template <typename U>
	void destroy(U* p) {
		p->~U();
	}

	...
};

template <class T, typename Allocator = MyAllocator<T>>
class vector {
public:
    using allocator_type = Allocator;
	...
private:
	using alloc_traits = std::allocator_traits<Allocator>;
    Allocator m_alloc;
    ...
```

实现了一个简单的分配器，并委托给 `std::allocator`，实现了以下功能：

- `allocate()`: 分配内存
- `deallocate()`: 释放内存
- `destroy()`:销毁对象，不释放内存

并将 vector 中涉及到内存分配的地方都喜欢了为 MyAllocator 的实现，由它进行内存管理。同时修改了构造函数，支持成员变量 m_alloc 的构造。
