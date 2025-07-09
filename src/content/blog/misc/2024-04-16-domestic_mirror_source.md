# Ubuntu 国内镜像源汇总

### apt 源

配置地址：`/etc/apt/sources.list`

apt 清华源：[ubuntu | 镜像站使用帮助 | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/)

<details>
<summary>快速配置镜像源</summary>

1. Ubuntu 20.04 LTS

```shell
sudo sh -c 'echo "deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ focal-security main restricted universe multiverse" > /etc/apt/sources.list'
```

2. Ubuntu 22.04 LTS

```shell
sudo sh -c 'echo "deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ jammy main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ jammy-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ jammy-security main restricted universe multiverse" > /etc/apt/sources.list'
```

</details>

apt 官方源：[Ubuntu 22.04 系统默认官方源/腾讯云源/清华源/中科大源/阿里云源](https://wph.im/213.html)

清除所有软件源：`sudo rm -rf /etc/apt/sources.list.d/*`

<br>

### pip 源

临时使用：`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple some-package`

设为默认：`pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple`

[pypi | 镜像站使用帮助 | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/help/pypi/)

<br>

### docker 源

[国内能用的Docker镜像源【2024最新持续更新】](https://blog.csdn.net/u014390502/article/details/143472743)

<br>

### conda 源

```shell
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/pytorch/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/pytorch/linux-64/
conda config --set show_channel_urls yes
```

<br>

### npm 源

`npm config set registry https://registry.npmmirror.com`

[npm 使用国内淘宝镜像（最新地址）\_npm 最新淘宝镜像-CSDN 博客](https://blog.csdn.net/chaoPerson/article/details/136121885)

<br>
