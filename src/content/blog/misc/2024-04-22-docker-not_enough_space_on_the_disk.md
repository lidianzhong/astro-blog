---

## title: "Docker 使得 Ubuntu 出现磁盘空间不足" date: 2024-04-22T02:15:05+08:00 lastmod: 2024-04-22T02:15:05+08:00 keywords:

## categories: # 没有分类界面可以不填写

## tags: # 标签

## description: "" weight: draft: false # 是否为草稿 comments: true # 本页面是否显示评论 reward: false # 打赏 mermaid: true #是否开启mermaid showToc: true # 显示目录 TocOpen: false # 自动展开目录 hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等 disableShare: true # 底部不显示分享栏 showbreadcrumbs: false #顶部显示路径 cover: image: "" #图片路径例如：posts/tech/123/123.png zoom: # 图片大小，例如填写 50% 表示原图像的一半大小 caption: "" #图片底部描述 alt: "" relative: false

# Docker 占用导致磁盘空间不足

### 原因分析

使用 df -h 发现，根目录的挂载 / 点的磁盘空间满了，然后发现是 docker 的原因，占用空间太大

### 解决方法

方法一：删除 docker Overlay2 中的部分内容

方法二（推荐）：修改 docker 的默认存储路径 `/var/lib/docker`

### 具体执行

参考：[记录一次 docker Overlay2 占用磁盘空间 99%的清理过程 | Laravel China 社区 (learnku.com)](https://learnku.com/articles/85263)

![](./2024-04-22-docker-not_enough_space_on_the_disk/rwuLgqvmA3DewWgjgtTQH.jpeg)