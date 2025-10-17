# VS 2019/2022 GoogleTest Exploer无测试用例

具体表现为：在VS中执行测试命令正常显示，但是 Test Exploer 检查到 0 个测试用例。尝试了很多方法。

最后的解决方法，是在 CMakeLists.txt 中直接 include 和添加 googletest 的源代码内容，最后成功让VS2022识别到：

将 googletest 和 googlemock 放在项目源码文件夹下，通过 include 和添加 source 文件：

添加的 include 头文件：

```cmake
./googletest/include
./googlemock/include
```

添加的源文件：

```cmake
./googletest/src/gtest-all.cc
./googlemock/src/gmock-all.cc
```



### 其他方法

- [No test found. Make sure that installed test discoverers & executors, platform & framework version settings are appropriate and try again](https://stackoverflow.com/questions/34790339/no-test-found-make-sure-that-installed-test-discoverers-executors-platform)