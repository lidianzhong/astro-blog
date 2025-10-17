# tinyhttpd

https://github.com/ithewei/libhv/blob/master/examples/tinyhttpd.c

这是一个基于 libhv 事件循环的极简 HTTP 服务器实现,采用了多线程 Reactor 模式。



> ### Reactor 模式
>
> 多线程 Reactor（Reactor Pattern with Thread Pool / Multi-Reactor）是一种**高性能网络服务器架构模式**，常用于构建像 **Nginx、libhv、Netty、Redis、Memcached** 这样的高并发网络程序。
>
> 它是在 **单线程 Reactor** 的基础上，为了更好地利用多核 CPU，将 **事件分发和事件处理拆分到多个线程中**。
>
>  
>
> 有这样几种 Reactor 模式
>
> 1. ​	单线程 Reactor 
>
>    ```diff
>    +-------------------+
>    | Reactor 主线程     | 监听全部 socket 事件(epoll)
>    |                   | → 收到事件
>    |                   | → 执行回调处理(读取/写入/业务)
>    +-------------------+
>    ```
>
>    实现起来简单、无锁；缺点就是所有操作都在一个线程，CPU 利用率低，不适合高并发业务
>
> 2. Reactor + 工作线程池
>
>    ```
>    [Reactor 主线程]
>        | epoll_wait 等待事件
>        | 当 socket 可读/可写
>        ↓
>    分发给 ↓ 工作线程池（Worker Threads）
>        | 每个线程执行业务逻辑 / 处理数据
>    ```
>
>    Reactor 只负责检测事件，不做重活；实际业务交给线程池，适合高并发业务型服务器
>
> 3. 主从 Reactor
>
>    ```
>    [主 Reactor]          (只负责接收连接 accept)
>           ↓ 分发连接
>    +-----------------------------+
>    | 从 Reactor 1 | 从 Reactor 2 | ... 每个维护自己的 epoll 线程
>    |              |              |
>    | IO 读写      | IO 读写      |
>    +--------------+--------------+
>    ```
>
>    主线程处理连接建立（accept），多个子 Reactor 线程分别处理 IO 事件，Nginx 就是此架构

这里的 Reactor 模式采用上述第二种方式。

```
┌─────────────────────────────────────────────────────────────┐
│                    Accept Thread (主线程)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  accept_loop                                        │    │
│  │  ├─ listenfd (监听 8000 端口)                        │    │
│  │  └─ on_accept: 接收新连接                            │    │
│  └──────────────────┬──────────────────────────────────┘    │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      │ 负载均衡分发
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    Worker Threads                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Worker 0        │ Worker 1        │ Worker N                │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐         │
│ │worker_loop 0│ │ │worker_loop 1│ │ │worker_loop N│         │
│ │ ├─ conn1    │ │ │ ├─ conn3    │ │ │ ├─ conn5    │         │
│ │ ├─ conn2    │ │ │ └─ conn4    │ │ │ └─ conn6    │         │
│ └─────────────┘ │ └─────────────┘ │ └─────────────┘         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

对应到代码，是这样创建的，将主线程作为 accept 线程，另外创建 N 个 worker 线程用于跑工作线程事件循环

```c
static hloop_t*  accept_loop = NULL;    // 接收线程的事件循环
static hloop_t** worker_loops = NULL;   // 工作线程的事件循环数组

int main(int argc, char** argv) {
    // 1. 创建 N 个 worker 线程
    worker_loops = (hloop_t**)malloc(sizeof(hloop_t*) * thread_num);
    for (int i = 0; i < thread_num; ++i) {
        worker_loops[i] = hloop_new(HLOOP_FLAG_AUTO_FREE);
        hthread_create(worker_thread, worker_loops[i]);  // 启动工作线程
    }

    // 2. 主线程作为 accept 线程
    accept_loop = hloop_new(HLOOP_FLAG_AUTO_FREE);
    accept_thread(accept_loop);
}
```



### 完整流程

上述main方法里的逻辑执行完了，此时当前线程应该有一个 tcp_server，且运行了事件循环，它就是 Accept Thread，其中的 on_accept 回调函数的内容就是实现负载均衡分发：

```c
static void on_accept(hio_t* io) {
    // 1. 从 accept_loop 中剥离连接
    hio_detach(io);
    //   ↓ 将 io 从 accept_loop 的管理中移除
    
    // 2. 选择一个 worker 线程 (Round-Robin 轮询)
    hloop_t* worker_loop = get_next_loop();
    
    // 3. 跨线程投递事件到 worker
    hevent_t ev;
    memset(&ev, 0, sizeof(ev));
    ev.loop = worker_loop;
    ev.cb = new_conn_event;      // worker 线程的回调
    ev.userdata = io;             // 传递 io 对象
    hloop_post_event(worker_loop, &ev);
    //   ↓ 线程安全地投递事件到 worker_loop
}

// Round-Robin 负载均衡
static hloop_t* get_next_loop() {
    static int s_cur_index = 0;
    if (s_cur_index == thread_num) {
        s_cur_index = 0;
    }
    return worker_loops[s_cur_index++];
    // 示例: 0 → 1 → 2 → 3 → 0 → 1 → ...
}
```

 当把事件投到 Workder 线程之后 (对应 new_conn_event 函数)，Worker 线程会开始处理。执行的内容大致是，将 io 关联到当前工作线程的 workder_loop，做一些准备工作，然后开始读取HTTP请求内容，直到遇到 \r\n。

之后是HTTP 解析状态机 (on_recv) 执行，对应代码和流程如下

```c
static void on_recv(hio_t* io, void* buf, int readbytes) {
    char* str = (char*)buf;
    http_conn_t* conn = (http_conn_t*)hevent_userdata(io);
    http_msg_t* req = &conn->request;
    
    switch (conn->state) {
    // ========== 状态1: 解析请求行 ==========
    case s_first_line:
        // 输入: "GET /ping HTTP/1.1\r\n"
        str[readbytes - 2] = '\0';  // 去掉 \r\n
        
        // 解析: 方法、路径、版本
        if (!parse_http_request_line(conn, str, readbytes - 2)) {
            hio_close(io);
            return;
        }
        // 结果: method="GET", path="/ping", major=1, minor=1
        
        // 继续读取 HTTP 头部
        conn->state = s_head;
        hio_readline(io);
        break;
    
    // ========== 状态2: 解析 HTTP 头 ==========
    case s_head:
        // 输入: "Content-Length: 12\r\n"
        //       "Content-Type: text/plain\r\n"
        //       "\r\n"  ← 空行表示头部结束
        
        if (readbytes == 2 && str[0] == '\r' && str[1] == '\n') {
            // 头部结束
            conn->state = s_head_end;
        } else {
            str[readbytes - 2] = '\0';
            if (!parse_http_head(conn, str, readbytes - 2)) {
                hio_close(io);
                return;
            }
            hio_readline(io);  // 继续读下一行
            break;
        }
    
    // ========== 状态3: 头部结束,检查 Body ==========
    case s_head_end:
        if (req->content_length == 0) {
            // 无 Body,直接处理请求
            conn->state = s_end;
            goto s_end;
        } else {
            // 有 Body,读取指定长度
            conn->state = s_body;
            hio_readbytes(io, req->content_length);
            //   ↓ 精确读取 content_length 字节
            break;
        }
    
    // ========== 状态4: 读取 Body ==========
    case s_body:
        req->body = str;
        req->body_len += readbytes;
        
        if (req->body_len == req->content_length) {
            // Body 读取完成
            conn->state = s_end;
        } else {
            // Body 太大,需要多次读取
            break;
        }
    
    // ========== 状态5: 请求完成,处理业务 ==========
    case s_end:
s_end:
        // 调用业务处理函数
        on_request(conn);
        
        if (hio_is_closed(io)) return;
        
        if (req->keepalive) {
            // HTTP/1.1 Keep-Alive: 重用连接
            memset(&conn->request,  0, sizeof(http_msg_t));
            memset(&conn->response, 0, sizeof(http_msg_t));
            conn->state = s_first_line;
            hio_readline(io);  // 等待下一个请求
        } else {
            // HTTP/1.0 或 Connection: close
            hio_close(io);
        }
        break;
    }
}
```

```
s_begin
  ↓
s_first_line  ← 读取 "GET /ping HTTP/1.1\r\n"
  ↓ parse_http_request_line
s_head        ← 读取 "Content-Length: 12\r\n"
  ↓ parse_http_head
  ↓ 遇到 "\r\n"
s_head_end
  ↓ 检查 content_length
  ├─ 0    → s_end (无 Body)
  └─ > 0  → s_body
              ↓ hio_readbytes(content_length)
            s_body  ← 读取 Body 数据
              ↓ body_len == content_length
            s_end
              ↓ on_request
              ├─ keepalive=1 → 重置状态,等待下一个请求
              └─ keepalive=0 → hio_close
```

再往后就是业务处理(on_request)了

```c
static int on_request(http_conn_t* conn) {
    http_msg_t* req = &conn->request;
    
    // ========== 路由表 ==========
    if (strcmp(req->method, "GET") == 0) {
        // GET /ping
        if (strcmp(req->path, "/ping") == 0) {
            http_reply(conn, 200, "OK", TEXT_PLAIN, "pong", 4);
            return 200;
        }
        
        // GET / 或 GET /index.html
        return http_serve_file(conn);
        
    } else if (strcmp(req->method, "POST") == 0) {
        // POST /echo
        if (strcmp(req->path, "/echo") == 0) {
            // 回显请求 Body
            http_reply(conn, 200, "OK", req->content_type, 
                      req->body, req->content_length);
            return 200;
        }
    }
    
    // 未实现的方法
    http_reply(conn, 501, NOT_IMPLEMENTED, TEXT_HTML, 
              HTML_TAG_BEGIN NOT_IMPLEMENTED HTML_TAG_END, 0);
    return 501;
}
```

然后是发送响应，通过调用 hio_write 实现

```c
static int http_reply(http_conn_t* conn,
            int status_code, const char* status_message,
            const char* content_type,
            const char* body, int body_len) {
    http_msg_t* req  = &conn->request;
    http_msg_t* resp = &conn->response;
    
    // 1. 构造响应头
    resp->major_version = req->major_version;
    resp->minor_version = req->minor_version;
    resp->status_code = status_code;
    strncpy(resp->status_message, status_message, 63);
    strncpy(resp->content_type, content_type, 63);
    resp->keepalive = req->keepalive;
    
    if (body) {
        if (body_len <= 0) body_len = strlen(body);
        resp->content_length = body_len;
        resp->body = (char*)body;
    }
    
    // 2. 序列化 HTTP 响应
    char* buf = NULL;
    STACK_OR_HEAP_ALLOC(buf, HTTP_MAX_HEAD_LENGTH + resp->content_length, 
                        HTTP_MAX_HEAD_LENGTH + 1024);
    int msglen = http_response_dump(resp, buf, 
                                    HTTP_MAX_HEAD_LENGTH + resp->content_length);
    
    // 3. 发送响应
    int nwrite = hio_write(conn->io, buf, msglen);
    
    STACK_OR_HEAP_FREE(buf);
    return nwrite < 0 ? nwrite : msglen;
}
```

响应格式像这样

```
HTTP/1.1 200 OK
Server: libhv/1.3.0
Connection: keep-alive
Content-Length: 4
Content-Type: text/plain
Date: Mon, 13 Oct 2025 12:34:56 GMT

pong
```

