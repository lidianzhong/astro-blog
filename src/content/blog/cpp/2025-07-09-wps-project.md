# WPS 项目结构总览

## 一、Bundle 系统架构

项目采用模块化的 Bundle 系统，主要组件包括：

- **core_bundle**: 核心框架和基础组件
- **shell_bundle**: 外壳和UI相关组件
- **api_bundle**: API接口层
- **foundation_bundle**: 基础工具库
- **io_bundle**: 输入输出处理
- **misc_bundle**: 第三方库和杂项组件
- **plugin_bundle**: 插件系统
- **test_bundle**: 测试组件



## 二、依赖管理



### 依赖配置

使用 `BuddleList.json` 来定义 Buddle 的依赖关系

```json
{
  "bundles": [
    {
      "name": "core_bundle",
      "type": "bundle", 
      "usage": "normal",
      "export": true,
      "depends": ["foundation_bundle"],
      "repolist": [{"path": "Coding/core_bundle"}]
    }
  ]
}
```



### 依赖解析

实现文件位置：`wps_bundle.cmake`



## 三、包管理系统

支持的包类型

- **SHARED**: 动态链接库
- **STATIC**: 静态链接库
- **EXECUTABLE**: 可执行文件
- **MODULE**: 模块库
- **CONSOLE**: 控制台应用



**如何定义一个包 ?**

使用 `wps_package()` 宏定义包：

```cmake
wps_package(wpsmain SHARED WINSDK_VERSION 0x0600)
    wps_add_definitions(SLM_WPS WPS_EXE_LIB __SHELL_MODULE__)
    wps_include_directories(.. Coding/core_bundle/include)
    wps_use_packages(Qt5Core Qt5Gui)
    wps_add_sources(main.cpp)
wps_end_package()
```



## 四、三方库管理

实现文件位置：`wps_3rdparty.cmake`



## 五、BUILD 系统

采用增量构建的方式，只有修改的 Bundle 会重新构建，依赖关系变化时会重建相关的 Bundle，还支持并行的构建



## 六、开发工具支持

