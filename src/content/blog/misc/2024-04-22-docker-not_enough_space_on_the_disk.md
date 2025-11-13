# Docker 占用导致磁盘空间不足

### 原因分析

使用 df -h 发现，根目录的挂载 / 点的磁盘空间满了，然后发现是 docker 的原因，占用空间太大

### 解决方法

方法一：删除 docker Overlay2 中的部分内容

方法二（推荐）：修改 docker 的默认存储路径 `/var/lib/docker`

### 具体执行

参考：[记录一次 docker Overlay2 占用磁盘空间 99%的清理过程 | Laravel China 社区 (learnku.com)](https://learnku.com/articles/85263)

![](https://raw.githubusercontent.com/lidianzhong/astro-blog/refs/heads/edit/src/content/blog/misc/2024-04-22-docker-not_enough_space_on_the_disk/pUuHvhZizG7mlrZgyvg-p.jpeg)