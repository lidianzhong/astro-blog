---
title: "第一篇文章"
date: "2025-07-05T19:39:19.768Z"
updatedAt: "2025-07-06T11:55:50.802Z"
---

# 欢迎来到我的第一篇文章

这是我的**第一篇**博客文章，下面展示一些常用的 Markdown 样式。

## 目录

1. [标题](#标题)
2. [列表](#列表)
3. [代码块](#代码块)
4. [引用](#引用)
5. [图片与链接](#图片与链接)
6. [表格](#表格)

---

## 标题

1. # 一级标题
2. ## 二级标题
3. ### 三级标题

---

## 列表

- 无序列表项一
- 无序列表项二
  - 嵌套项

1. 有序列表项一
2. 有序列表项二

---

## 代码块

1. 行内代码：`std::cout << "Hello, world!";`
2. 多行代码：

    ```cpp
    #include <iostream>
    int main() {
        std::cout << "Hello, Markdown!" << std::endl;
        return 0;
    }
    ```

---

## 引用

> 这是一段引用文本。

---

## 图片与链接

1. ![Markdown Logo](https://markdown-here.com/img/icon256.png)
2. [访问 Markdown 官方网站](https://www.markdownguide.org/)

---

## 表格

| 语言   | 难度 | 类型   |
| ------ | ---- | ------ |
| C++    | 高   | 编译型 |
| Python | 低   | 解释型 |

---

感谢阅读！

## Bazel 找不到 Visual Studio 或 Visual C++

可能的原因：

1. 您安装了多个版本的 Visual Studio
2. 您安装和移除了各种版本的 Visual Studio
3. 您安装了不同版本的 Windows SDK
4. 您安装 Visual Studio 的位置不是默认安装路径

**解决方案**：

1. 依次前往“开始”菜单 >“设置”。
2. 找到“修改账号的环境变量”设置。
3. 查看顶部的列表（“<username> 的用户变量”），然后点击其下方的“新建...”按钮。
4. 在“变量名称”中，输入 BAZEL_VC。
5. 点击“浏览目录...”。
6. 前往 Visual Studio 的 VC 目录。例如，在您的系统中，此值可能是 `C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC`。
7. 选择 VC 文件夹，然后点击“确定”。
8. “变量值”字段现在包含 VC 的路径。点击“确定”关闭窗口。
9. 点击“完成”按钮。

如果您现在打开新的 cmd.exe 或 PowerShell 终端并运行 Bazel，它会找到 Visual C++。
