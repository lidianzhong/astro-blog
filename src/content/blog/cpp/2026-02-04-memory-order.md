# [C++并发] C++内存模型

### scene 1

```cpp
int data = 0;

void entry(MTIndex<0>) { // 0 号线程
  data = 42;
}

void entry(MTIndex<1>) { // 1 号线程
  MTTest::result = data;
}
```

当前，0号线程写入，1号线程读取，显然会发生数据竞争问题，得到的 result 结果可能为0或42。



### scene 2

那么添加一个 while 循环等待呢？直到数据被写入了这时再读取，像这样

```cpp
int data = 0;

void entry(MTIndex<0>) { // 0 号线程
  data = 42;
}

void entry(MTIndex<1>) { // 1 号线程
  while (data == 0)
    ; 
  MTTest::result = data;
}
```

这样是不行的，这是因为在不同线程进行副作用的访问属于未定义行为，编译器可以基于此做优化。编译器可能尝试先将 data 的值读出来，然后while循环只判断寄存器的值就可以了，也就是像这样

```cpp
int data = 0;

void entry(MTIndex<0>) { // 0 号线程
  data = 42;
}

void entry(MTIndex<1>) { // 1 号线程
  auto eax = data;
  while (eax == 0)
    ; 
  MTTest::result = data;
}
```

这样1号线程在循环时就感知不到0号线程数据的变化了，就会死循环。



### scene 3

换个方式来描述当前程序情况：0号线程的修改对1号线程**不可见。**

现在我们使用atomic修饰来解决。

```cpp
std::atomic_int data = 0; // 使用 atomic 修饰

void entry(MTIndex<0>) { // 0 号线程
  data = 42; // 相当于 data.store(42, std::memory_order_seq_cst)
}

void entry(MTIndex<1>) { // 1 号线程
  while (data == 0) // 相当于 while (data.load(std::memory_order_seq_cst) == 0)
    ; 
  MTTest::result = data;
}
```

这样可行的本质是，`std::atomic` 的操作默认使用 `std::memory_order_seq_cst`（顺序一致性）。效果是，一旦0号线程写入42，1号线程的while循环一定能看到这个值的更新。要满足这个要求，编译器生成的汇编代码就不会再是下面这样的了。

```cpp
int data = 0;

void entry(MTIndex<0>) { // 0 号线程
  data = 42;
}

void entry(MTIndex<1>) { // 1 号线程
  auto eax = data;
  while (eax == 0)
    ; 
  MTTest::result = data;
}
```

也就是说，默认使用的 `std::memory_order_seq_cst` 的这个内存序，保证了 data=42 这个写入对所有线程可见，且 data==0 读取时能看到所有线程写入的数据。



### scene 4

atomic 发挥两个作用，原子性+内存序。可以利用atomic的flag变量，影响其它变量

```cpp
int data = 0;
char space[64];
std::atomic_int flag = 0;

void entry(MTIndex<0>) { // 0 号线程
  data = 42;
  flag.store(1, std::memory_order_seq_cst);
}

void entry(MTIndex<1>) { // 1 号线程
  while (flag.load(std::memory_order_seq_cst) == 0)
    ; 
  MTTest::result = data;
}
```

这里的flag产生了内存屏障从而保证了data的线程安全

```cpp
int data = 0;
char space[64];
std::atomic_int flag = 0;

void entry(MTIndex<0>) { // 0 号线程
  data = 42;
  // barrier
  flag.store(1, std::memory_order_seq_cst);
  // barrier
}

void entry(MTIndex<1>) { // 1 号线程
  // barrier
  while (flag.load(std::memory_order_seq_cst) == 0)
    ; 
  // barrier
  MTTest::result = data;
}
```

这里可以使用 release 和 acquire 优化

```cpp
int data = 0;
char space[64];
std::atomic_int flag = 0;

void entry(MTIndex<0>) { // 0 号线程
  data = 42;
  // barrier
  flag.store(1, std::memory_order_release);
}

void entry(MTIndex<1>) { // 1 号线程
  while (flag.load(std::memory_order_acquire) == 0)
    ; 
  // barrier
  MTTest::result = data;
}
```

release 和 acquire 配合使用，release 之前的写入对于 acquire 后的读取可见。



### scene 5

看下面一段最朴素的程序，它是线程安全的吗？

```cpp
std::atomic<int> data = 0;

void entry(MTIndex<0>) {
  data = data + 1; // data.store(data.load() + 1)
}

void entry(MTIndex<1>) {
  data = data + 1;
}

void teardown() {
  MTTest::result = data;
}
```

不是，因为对于`data = data + 1 `，它是三条指令，并不是原子的。

那么这样是线程安全的吗？

```cpp
std::atomic<int> data = 0;

void entry(MTIndex<0>) {
  data.fetch_add(1, std::memory_order_relaxed);
}

void entry(MTIndex<1>) {
  data.fetch_add(1, std::memory_order_relaxed);
}

void teardown() {
  MTTest::result = data;
}
```

是的，因为0号线程和1号线程之间没有依赖关系，fetch_add 可以保证自己的原子性。



### scene 6

我们知道对于atomic封装的变量，标准库提供了 fetch_add 等原子性的方法，那么如果我现在要对变量进行平方呢？例如下面这段程序

```cpp
int data = 2;

void entry(MTIndex<0>) {
  data = data * data;
}

void entry(MTIndex<1>) {
  data = data * data;
}

void teardown() {
  MTTest::result = data;
}
```

使用 compare_exchange_strong来解决这类问题

```cpp
std::atomic<int> data = 2;

void entry(MTIndex<0>) {
again:
  auto old_data = data.load();
  auto new_data = old_data * old_data;
  if (!data.compare_exchange_strong(old_data, new_data)) {
    goto again;
  }
}

void entry(MTIndex<1>) {
again:
  auto old_data = data.load();
  auto new_data = old_data * old_data;
  if (!data.compare_exchange_strong(old_data, new_data)) {
    goto again;
  }
}

void teardown() {
  MTTest::result = data;
}
```

先了解 compare_exchange_strong 的用法，这个函数被称为 CAS 操作，签名如下

```cpp
bool compare_exchange_strong(T& expected, T desired);
// expected：你“预期”变量现在应该有的值
// desired：如果你预期对了，想要写入的新值
// 返回值:
//   如果 data == expected，则执行 data = desired，返回 true（交换成功）。
//   如果 data != expected，则不进行交换，而是将 expected 更新为 data 的当前实际值，返回 false（交换失败）。
```

程序逻辑用简单来说就是，查一下旧值data，如果在此期间没有其他线程修改data，交换成功；如果其他线程抢先一步修改了data，交换失败，old_data 被自动更新为新值，goto again 重新计算。

> C++ 还有一个 `compare_exchange_weak` ，和strong的相比是返回值的逻辑有些不一样。strong中如果data ≠ expected，会返回 false，而 weak 中即使 data == expected，也可能会返回失败。对于有 while 或 goto 循环的场景中，可以使用 weak，因为返回 false 再循环判断一次也无伤大雅，也能保证程序运行结果正确。



### scene 7 - 实现自旋锁

实现的自旋锁将使用下述代码进行验证

```cpp
struct SpinMutex {
  void lock() {
    // todo
  }

  void unlock() {
    // todo
  }
};

int data = 0;
SpinMutex mutex;

void entry(MTIndex<0>) {
  mutex.lock();
  data += 1;
  mutex.unlock();
}

void entry(MTIndex<1>) {
  mutex.lock();
  data += 1;
  mutex.unlock();
}

void teardown() {
  MTTest::result = data;
}
```

```cpp
struct SpinMutex {
  void lock() {
    while (flag != 0)
      ;
    flag = 1;
  }

  void unlock() {
    flag = 0;
  }

  std::atomic<int> flag{0};
}
```

这里的操作会失败，原因为 flag 执行了多次操作，这在原子变量的操作中是不允许的，解决方法是可以利用前边的 compare_exchange_strong，将多个操作合为一个。

```cpp
struct SpinMutex {
  bool try_lock() {
    int old = 0;
    if (compare_exchange_strong(old, 1)) 
      return true;
    return false;
  }

  void lock() {
    while (!try_lock())
      ;
  }
  // 或者这种实现也是可以的
  // void lock() {
  //   int old = 0;
  //   while (!flag.compare_exchange_weak(old, 1))
  //     old = 0;
  // }

  void unlock() {
    flag = 0;
  }

  std::atomic<int> flag{0};
}
```

标准库的 std::mutex 的实现是先尝试自旋一小会，若仍然未等到则调用系统调用挂起线程，可以使用 C++20 的 atomic wait 来完成

```cpp
struct SpinMutex {
  void lock() {
    bool old;
#if __cpp_lib_atomic_wait
    int retries = 1000;
    do {
      old = false;
      if (flag.compare_exchange_weak(old, true, std::memory_order_acquire, std::memory_order_relaxed))
        return;
    } while (--retries);
#endif
    do {
#if __cpp_lib_atomic_wait
      flag.wait(true, std::memory_order_relaxed); // wait until flag != true
#endif
      old = false;
    } while (!flag.compare_exchange_weak(old, true, std::memory_order_acquire, std::memory_order_relaxed));
    // load barrier
  }

  void unlock() {
    // store barrier
    flag.store(false, std::memory_order_release);
    flag.notify_one(); // flag changed, notify one of the waiters
  }

  std::atomic<bool> flag{false};
}
```

### scene 8 - 实现线程安全的无锁链表

首先可以得知标准库的链表不是线程安全的，我们这么写有并发问题

```cpp
std::list<int> data;

void entry(MTIndex<0>) {
  data.push_back(1);
}

void entry(MTIndex<1>) {
  data.push_back(2);
}

void teardown() {
  MTTest::result = data.size(); // 1 or 2
}
```

如果使用锁的话，可以使用锁来构成 happens-before 关系

```cpp
std::list<int> data;
std::mutex mutex;

void entry(MTIndex<0>) {
  mutex.lock();
  data.push_back(1);
  mutex.unlock();
}

void entry(MTIndex<1>) {
  mutex.lock();
  data.push_back(2);
  mutex.unlock();
}

void teardown() {
  MTTest::result = data.size(); // must be 2
}
```

现在使用无锁编程来完成线程安全的无锁链表

```cpp
struct MyList {
  struct Node {
    Node *next;
    int value;
  };

  std::atomic<Node*> head{nullptr};

  void push_front(int value) {
    Node *new_node = new Node;
    new_node->value = value;

    Node *old_head = head.load(std::memory_order_relaxed);
    do {
      new_node->next = old_head;
    }
    while (!head.compare_exchange_weak(old_head, new_node, std::memory_order_release, std::memory_order_relaxed));
#if __cpp_lib_atomic_wait
    head.notify_one();
#endif
  }

  int pop_front() {
    Node *old_head = head.load(std::memory_order_relaxed);
    do {
      if (old_head == nullptr) 
        return -1;
    } while (!head.compare_exchange_weak(old_head, old_head->next, std::memory_order_acquire, std::memory_order_relaxed));
    int value = old_head->value;
    delete old_head;
    return value;
  }

  int pop_front_wait() {
    Node *old_head = head.load(std::memory_order_relaxed);
    do {
      while (old_head == nullptr) 
#if __cpp_lib_atomic_wait
        int retries = 200;
        if (retries <= 0) {
          head.wait(nullptr, std::memory_order_relaxed);
          --retries;
        }
#endif
        old_head = head.load(std::memory_order_relaxed);
    } while (!head.compare_exchange_weak(old_head, old_head->next, std::memory_order_acquire, std::memory_order_relaxed));
    int value = old_head->value;
    delete old_head;
    return value;
  }

  int size_unsafe() {
    int count = 0;
    Node* node = head.load();
    while (node != nullptr) {
      count++;
      node = node->next;
    }
    return count;
  }
}
```

为什么第三个参数使用 release 或 acquire，而第四个参数使用 relaxed 即可？

第三个参数是指CAS成功时的内存序，release是为了保证在修改原子变量之前，所有的内存写入，如 `new_node->value = value;` 都已完成，以便其它线程能看到。

第四个参数是指CAS失败时的内存序，CAS失败只要把 head 自身的值加载回 old_head 即可，不依赖其他非原子变量的可见性，所以 `relaxed` 已经足够。