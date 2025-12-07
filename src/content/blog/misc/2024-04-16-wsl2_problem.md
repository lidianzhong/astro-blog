# WSL 问题汇总

### 安装网络问题
1. 无法解析的服务器名称，`Error code: Wsl/WININET_E_NAME_NOT_RESOLVED` ，或者 `Wsl/InstallDistro/WININETECANNOT_CONNECT`

```shell
 PS C:\Users\DianzhongLi> wsl --list --online
 无法从“https://raw.githubusercontent.com/microsoft/WSL/master/distributions/DistributionInfo.json”中提取列表分发。无法解析服务器的名称或地址
 Error code: Wsl/WININET_E_NAME_NOT_RESOLVED

```

解决方法：
1. 使用代理或者 VPN（比如使用[ Steam++](https://steampp.net/) 的网络加速）
2. 在 `hosts` 中指定 `raw.githubusercontent.com` 的对应 ip

[安装 WSL 报错 Error code: Wsl/WININET_E_NAME_NOT_RESOLVED 问题解决-CSDN 博客](https://blog.csdn.net/u013737132/article/details/136280824)

---
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