# 如何切换不同的 CUDA 版本

使用 `nvidia-smi` 命令显示的 cuda 版本表示支持最高的版本，并不是当前 cuda 的版本。

查看当前 cuda 版本的命令是使用 `nvcc -V` 命令，显示的 cuda 版本。

cuda 版本支持切换，主要是根据 PATH 中的指向来确定的

切换 cuda 版本的命令如下

``` shell
# <version> 须切换的CUDA版本号
export PATH=/usr/local/cuda-<version>/bin${PATH:+:${PATH}} 
export LD_LIBRARY_PATH=/usr/local/cuda-<version>/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
```

[[解決方案\] conda 虚拟环境中 cuda不同版本進行切換（含Linux 和 Windows）_修改cuda版本-CSDN博客](https://blog.csdn.net/weixin_43305485/article/details/130413708)

[CUDA的正确安装/升级/重装/使用方式 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/520536351)

[ubuntu下安装多版本cuda及版本切换教程_ubuntu切换cuda版本-CSDN博客](https://blog.csdn.net/weixin_44120025/article/details/121002696)

