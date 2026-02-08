# 内存池与多态分配器

在c语言中，内存分配使用malloc和free，在c++语言中，内存分配使用new/delete或者std::allocate。对于std::vector或者std::list这类容器，无疑需要进行内存分配，往往我们可以不指定分配器采用内置实现。可以想到的是，我们可以手动控制精确内存分配。

## 自定义分配器

一个最小满足的 MyAllocator 实现可以是以下这样

```cpp
#include <cstddef>
#include <new>
#include <limits>

template<typename T>
class MyAllocator {
public:
    using value_type = T;

    MyAllocator() noexcept = default;

    template<typename U>
    MyAllocator(const MyAllocator<U>&) noexcept {}

    T* allocate(std::size_t n) {
        if (n == 0) return nullptr;
        if (n > std::numeric_limits<std::size_t>::max() / sizeof(T)) {
            throw std::bad_alloc();
        }

        void *p = ::operator new(n * sizeof(T));
        return static_cast<T*>(p);
    }

    void deallocate(T* p, std::size_t n) noexcept {
        if (!p) return;

        ::operator delete(p);
    }
};

template <typename T, typename U>
bool operator==(const MyAllocator<T>&, const MyAllocator<U>&) { return true; }

template <typename T, typename U>
bool operator!=(const MyAllocator<T>&, const MyAllocator<U>&) { return false; }
```

创建 vector 可以使用 `std::vector<int, MyAllocator<int>> v;` 以上程序模拟了标准库std::allocator<T>的默认实现。



## “水位线分配器”

上述实现和直接 new/delete 并无两样，要实现从内存池分配内存，可以想到的最简单方法是创建一个 buf，每次创建划出一块用于内存

```cpp
#include <cstddef>

static char g_buf[65536 * 30];

struct MyMemoryResource {
    size_t watermark_ = 0;
    char* buf_ = g_buf;

    char* do_allocate(size_t n, size_t align) {
        watermark_ = (watermark_ + align - 1) & ~(align - 1);
        char* p = buf_ + watermark_;
        watermark_ += n;
        return p;
    }
};

template<typename T>
class MyAllocator {
public:
    MyMemoryResource *resource_{};

    using value_type = T;

    MyAllocator(MyMemoryResource* resource) : resource_(resource) {}

    template<typename U>
    MyAllocator(const MyAllocator<U>& other) noexcept : resource_(other.resource_) {}
    
    T* allocate(std::size_t n) {
        void *p = resource_->do_allocate(n * sizeof(T), alignof(T));
        return static_cast<T*>(p);
    }

    void deallocate(T* p, std::size_t n) noexcept {}
};

template <typename T, typename U>
bool operator==(const MyAllocator<T>& a, const MyAllocator<U>& b) { 
    return a.resource_ == b.resource_; 
}

template <typename T, typename U>
bool operator!=(const MyAllocator<T>& a, const MyAllocator<U>& b) { 
    return a.resource_ != b.resource_; 
}
```

这里分离了 MyAllocator 和 MyMemoryResource，分配的资源空间只要一份就可以，每个使用MyAllocator的对象只需要保留一个指针的大小，指向MyMemoryResource即可。



## pmr 多态分配器

C++17，我们可以使用pmr，对于自定义分配器，我们可以这么使用

```cpp
std::pmr::monotonic_buffer_resource mem;
std::vector<char, std::pmr::polymorphic_allocator<char>> v{std::pmr::polymorphic_allocator<char>{&mem}};
// 或者 std::pmr::vector<int>
```

我们可以类比polymorphic_allocator和前面我们实现的MyAllocator，monotonic_buffer_resource类比MyMemoryResource，可以从定义看出来

```cpp
template <class T>
class polymorphic_allocator {
    memory_resource* m_resource; // 指向多态资源基类 !!!
public:
    // ... allocate / deallocate ...
};
```

由于这里的m_resource是个基类，我们可以通过传入不同的派生类来决定使用何种内存分配方式，标准库提供了以下 “MyMemoryResource"
1. `std::pmr::monotonic_buffer_resource` 有点像刚才“水位线分配器”，只增不减，最后统一释放。
2. `std::pmr::unsynchronized_pool_resource`  通过维护多个链表，这种能有效减少内存碎片，比直接调用 new 快得多
3. `std::pmr::new_delete_resource()` 返回全局单例，底层就是普通的 new 和 delete



## pmr buffer_resource 传递参数相关

我们在使用pmr buffer_resource相关池资源时，可以不指定参数，那么它会使用默认的上游资源，通常是`std::pmr::get_default_resource()` ，即底层的 new/delete操作，比如有时会向堆申请一块较大的内存块。

其实你可以向 buffer_resource 传入一个预先创建好的buf空间

```cpp
char buffer[1024];
std::pmr::monotonic_buffer_resource res(buffer, sizeof(buffer));
```

它会优先使用你提供的这段空间，所有的 allocate 请求会从这个 buf 里切割。如果你申请的总量超过了 buf，比如 1024，它并不会报错，而是不转向上游分配器，默认是堆，申请后续的内存块。

这里有个好的实践，极速分配。如果你知道 90% 的情况下 1KB 足够用，那么这 1KB 的分配完全在栈上完成，零系统调用开销。