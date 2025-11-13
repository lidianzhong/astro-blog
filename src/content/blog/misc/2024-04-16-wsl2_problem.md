---

title: "WSL 安装过程中出现的问题汇总"
published: 2024-04-16T13:13:20+08:00
lastmod: 2024-04-16T13:13:20+08:00
category: "工具"
tags: ["WSL", "BUG"]
description: ""
weight:

## draft: false # 是否为草稿 comments: true # 本页面是否显示评论 reward: false # 打赏 mermaid: true #是否开启mermaid showToc: true # 显示目录 TocOpen: false # 自动展开目录 hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等 disableShare: true # 底部不显示分享栏 showbreadcrumbs: false #顶部显示路径 cover: image: "" #图片路径例如：posts/tech/123/123.png zoom: # 图片大小，例如填写 50% 表示原图像的一半大小 caption: "" #图片底部描述 alt: "" relative: false

# WSL 问题汇总

### 安装网络问题
1. 无法解析的服务器名称，`Error code: Wsl/WININET_E_NAME_NOT_RESOLVED`

```shell
 PS C:\Users\DianzhongLi> wsl --list --online
 无法从“https://raw.githubusercontent.com/microsoft/WSL/master/distributions/DistributionInfo.json”中提取列表分发。无法解析服务器的名称或地址
 Error code: Wsl/WININET_E_NAME_NOT_RESOLVED

```

解决方法：
1. 使用代理或者 VPN
2. 在 `hosts` 中指定 `raw.githubusercontent.com` 的对应 ip

[安装 WSL 报错 Error code: Wsl/WININET_E_NAME_NOT_RESOLVED 问题解决-CSDN 博客](https://blog.csdn.net/u013737132/article/details/136280824)
2. wsl 报 Temporary failure in name resolution 错误，`ping: baidu.com: Temporary failure in name resolution`

解决方法：

在 `/etc/wsl.conf`文件中，添加 `generateHosts=false`

### 屏幕缩放问题

使用 `export GDK_DPI_SCALE=1.5` 即可解决。

[屏幕缩放问题的其它解决方案](https://github.com/microsoft/wslg/issues/23)

### 不能显示中文字符

```shell
 sudo mkdir /usr/share/fonts/win11
 sudo ln -s /mnt/c/Windows/Fonts/* /usr/share/fonts/win11

```