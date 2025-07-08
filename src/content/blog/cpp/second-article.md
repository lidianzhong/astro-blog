---
title: "第二篇文章"
date: "2025-07-05T19:39:19.768Z"
updatedAt: "2025-07-06T11:55:50.802Z"
---

# 第一个Java程序

我们来编写第一个Java程序。

打开文本编辑器，输入以下代码：

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

在一个Java程序中，你总能找到一个类似：

```java
public class Hello {
    ...
}
```

的定义，这个定义被称为class（类），这里的类名是`Hello`，大小写敏感，`class`用来定义一个类，`public`表示这个类是公开的，`public`、`class`都是Java的关键字，必须小写，`Hello`是类的名字，按照习惯，首字母`H`要大写。而花括号`{}`中间则是类的定义。

注意到类的定义中，我们定义了一个名为`main`的方法：

```java
public static void main(String[] args) {
    ...
}
```
