# 为 DLL 编写单元测试



### 导出一个 DLL

举个例子以展示导出一个DLL需要做的工作

首先，定义好导出函数的头文件

```c++
#pragma once

#ifdef _WIN32
    #ifdef MATH_DLL_EXPORTS
        #define MATH_API __declspec(dllexport)
    #else
        #define MATH_API __declspec(dllimport)
    #endif
#else
    #define MATH_API
#endif

// Exported functions
extern "C" {
    MATH_API int add(int a, int b);
    MATH_API int multiply(int a, int b);
    MATH_API double calculate_area(double radius);
}

// Non-exported function (only declared, not exported)
int internal_helper(int value);
```



然后，定义成共享库 (SHARED)

```cmake
# Create the DLL
add_library(math_dll SHARED
    src/math_functions.cpp
)
```



接着，包含 include 目录

```cmake
target_include_directories(math_dll PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)
```



接着，定义导出符号 (暂且理解为固定格式)

```cmake
# Define export macro
target_compile_definitions(math_dll PRIVATE MATH_DLL_EXPORTS)
```



我们可以通过 dumpbin 工具分析一下 dll 的导出符号, 看看我们需要的符号是否已经导出



### 如何使用导出的 DLL

这里以单元测试为例，通过在 googletest 框架中链接 dll，来说明 dll 的使用



为 executable 文件链接上刚刚导出的 DLL，并设置好 include 目录，就可以了

```cmake
add_executable(test_app
    src/main.cpp
)

target_link_libraries(test_app math_dll)
target_include_directories(test_app PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)
```



这样设置好之后，在 test 中的 main函数就可以直接引用头文件，进行使用了。注意这里只能使用 DLL 中导出的函数，未导出的函数不能使用 (否则就会在编译时汇报链接错误 `main.obj : error LNK2019: 无法解析的外部符号 "int __cdecl internal_helper(int)" (?internal_helper@@YAHH@Z)，函数 main 中引用了该符号`)

正确的代码使用如下

```cpp
#include <iostream>
#include "math_functions.h"

int main() {
    // Using exported functions
    int sum = add(5, 3);
    int product = multiply(4, 7);
    double area = calculate_area(2.5);

    std::cout << "Sum: " << sum << std::endl;
    std::cout << "Product: " << product << std::endl;
    std::cout << "Area: " << area << std::endl;

    // internal_helper is not exported, so this would cause a linker error:
    // int helper_result = internal_helper(5);

    return 0;
}
```



---



### 为 DLL 中不进行外部导出的函数进行单元测试

