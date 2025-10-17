# tcp_chat_server

https://github.com/ithewei/libhv/blob/master/examples/tcp_chat_server.c

### 总览

```c
// tcp_chat_server.c 中的调用
int main() {
    hloop_t* loop = hloop_new(0);
    
    // ============ 这一行完成了所有工作 ============
    hio_t* listenio = hloop_create_tcp_server(loop, "0.0.0.0", 1234, on_accept);
    
    // 内部执行:
    // 1. socket(AF_INET, SOCK_STREAM, 0) → fd=3
    // 2. setsockopt(fd=3, SO_REUSEADDR)
    // 3. bind(fd=3, 0.0.0.0:1234)
    // 4. listen(fd=3, 128)
    // 5. hio_get(loop, fd=3) → 创建IO对象
    // 6. io->accept_cb = on_accept
    // 7. io->accept = 1
    // 8. epoll_ctl(epfd, EPOLL_CTL_ADD, fd=3, EPOLLIN)
    
    if (listenio == NULL) {
        return -20;
    }
    
    printf("listenfd=%d\n", hio_fd(listenio));  // 输出: listenfd=3
    
    // 启动事件循环
    hloop_run(loop);
    //   ↓ 循环执行:
    //   while (1) {
    //       epoll_wait(epfd, events, size, 100ms);
    //       if (events[0].fd == 3) {
    //           connfd = accept(3, ...);
    //           on_accept(connio);  // 调用用户回调
    //       }
    //   }
    
    hloop_free(&loop);
}
```



首先通过 hloop_new 做一些初始化配置

接着做了这么几件事

```c
// 用户代码
hio_t* listenio = hloop_create_tcp_server(loop, "0.0.0.0", 1234, on_accept);
    ↓
// 顶层 API
hloop_create_tcp_server(loop, host, port, accept_cb)
    ↓
// 创建socket
hio_create_socket(loop, host, port, HIO_TYPE_TCP, HIO_SERVER_SIDE)
    ↓
// 注册到事件循环
hio_accept(io)
```

下面详细分析一下

首先是顶层接口 hloop_create_tcp_server，做了这么几件事：1.创建监听socket，2.设置accept回调 3. 开始监听

```c
hio_t* hloop_create_tcp_server(hloop_t* loop, const char* host, int port, haccept_cb accept_cb) {
    // 1. 创建监听socket
    hio_t* io = hio_create_socket(loop, host, port, HIO_TYPE_TCP, HIO_SERVER_SIDE);
    if (io == NULL) return NULL;
    
    // 2. 设置accept回调
    hio_setcb_accept(io, accept_cb);
    
    // 3. 开始监听
    if (hio_accept(io) != 0) return NULL;
    
    return io;
}
```



其中，创建监听 socket （调用 hio_create_socket）的时候，主要做了这么几件事：1. 创建 socket，绑定地址，2.调用系统调用 listen 开始监听，3.调用 hio_get 创建 IO 对象

```c
socket(AF_INET, SOCK_STREAM, 0)  → sockfd=3
  ↓
setsockopt(sockfd, SO_REUSEADDR)  → 地址重用
  ↓
bind(sockfd, 0.0.0.0:1234)        → 绑定地址
  ↓
listen(sockfd, 128)               → 开始监听
  ↓
hio_get(loop, sockfd=3)           → 创建IO对象
```



调用 hio_accept(io) 开始监听部分，主要就是注册读事件（调用 hio_add）到事件循环，hio_add 中做了这么几件事

```c
int hio_add(hio_t* io, hio_cb cb, int events) {
    hloop_t* loop = io->loop;
    
    // 1. 激活IO对象
    if (!io->active) {
        EVENT_ADD(loop, io, cb);
        loop->nios++;
    }
    
    // 2. 确保就绪
    if (!io->ready) {
        hio_ready(io);
    }
    
    // 3. 设置回调
    if (cb) {
        io->cb = (hevent_cb)cb;  // hio_handle_events
    }
    
    // 4. 注册到epoll
    if (!(io->events & events)) {
        iowatcher_add_event(loop, io->fd, events); // 添加到 epoll
        io->events |= events;
    }
    
    return 0;
}
```

其中 iowatcher_add_event 是关键函数，将 io 事件添加到 epoll 中进行管理

```c
int iowatcher_add_event(hloop_t* loop, int fd, int events) {
    if (loop->iowatcher == NULL) {
        iowatcher_init(loop);  // 创建epoll实例
    }
    epoll_ctx_t* epoll_ctx = (epoll_ctx_t*)loop->iowatcher;
    
    struct epoll_event ee;
    memset(&ee, 0, sizeof(ee));
    ee.data.fd = fd;
    
    // 设置监听事件
    if (events & HV_READ) {
        ee.events |= EPOLLIN;
    }
    if (events & HV_WRITE) {
        ee.events |= EPOLLOUT;
    }
    
    // 添加到epoll
    int op = io->events == 0 ? EPOLL_CTL_ADD : EPOLL_CTL_MOD;
    epoll_ctl(epoll_ctx->epfd, op, fd, &ee);
    // epoll_ctl(epfd, EPOLL_CTL_ADD, fd=3, EPOLLIN)
    
    if (op == EPOLL_CTL_ADD) {
        if (epoll_ctx->events.size == epoll_ctx->events.maxsize) {
            events_double_resize(&epoll_ctx->events);
        }
        epoll_ctx->events.size++;
    }
    
    return 0;
}
```



### 执行前后数据结构变化

执行前

```c
loop->ios.ptr[3] = NULL
loop->nios = 0
epoll监听列表: 空
```

执行后

```c
// 1. IO对象数组
loop->ios.ptr[3] = hio_t {
    .fd = 3,                       // 监听socket
    .loop = loop,                  // 所属事件循环
    .event_type = HEVENT_TYPE_IO,
    .io_type = HIO_TYPE_TCP,
    .events = HV_READ,             // 监听读事件
    .cb = hio_handle_events,       // 事件处理回调
    .accept_cb = on_accept,        // accept回调
    .accept = 1,                   // 标记为accept模式
    .active = 1,                   // 已激活
    .priority = HEVENT_HIGH_PRIORITY,  // 高优先级
    .localaddr = {
        .sin_family = AF_INET,
        .sin_addr.s_addr = INADDR_ANY,  // 0.0.0.0
        .sin_port = htons(1234)
    }
};

// 2. 事件循环统计
loop->nios = 1;
loop->nactives = 1;

// 3. epoll监听列表
epoll监听: fd=3, events=EPOLLIN
```



### 运行时调用流程

```c
// 1. 客户端发起连接
客户端执行: connect(server_addr)
    ↓
// 2. 服务器内核处理
内核: TCP三次握手完成
内核: fd=3 (监听socket) 变为可读
    ↓
// 3. epoll_wait返回
epoll_wait(epfd, events, size, timeout)
  返回: events[0] = {fd=3, events=EPOLLIN}
    ↓
// 4. 事件循环处理
hloop_process_ios(loop, timeout)
  → iowatcher_poll_events(loop, timeout)
    → io = loop->ios.ptr[3]  // 获取监听IO对象
    → io->revents |= HV_READ
    → EVENT_PENDING(io)       // 加入待处理队列
    ↓
// 5. 分发事件
hloop_process_pendings(loop)
  → io->cb(io)  // 调用 hio_handle_events
    → nio_accept(io)  // 因为 io->accept = 1
      → connfd = accept(fd=3, &peeraddr, &addrlen)  // 返回 connfd=4
      → connio = hio_get(loop, connfd=4)
      → connio->accept_cb = io->accept_cb  // 继承回调
      → __accept_cb(connio)
        → hio_accept_cb(connio)
          → on_accept(connio)  // 用户回调!!!
```



