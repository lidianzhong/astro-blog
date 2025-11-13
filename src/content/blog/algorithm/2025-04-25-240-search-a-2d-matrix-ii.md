---
title: "240. 搜索二维矩阵"
published: 2025-04-25
lastmod: 2025-04-25
category: "算法"
tags: ["算法", "Leetcode"]
description: '编写一个高效的算法来搜索 m x n 矩阵 matrix 中的一个目标值 target 。该矩阵具有以下特性：
每行的元素从左到右升序排列。
每列的元素从上到下升序排列。'
weight: 240
draft: false # 是否为草稿
comments: true # 本页面是否显示评论
reward: false # 打赏
mermaid: true #是否开启mermaid
showToc: true # 显示目录
TocOpen: false # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: false #顶部显示路径
cover:
  image: "" #图片路径例如：posts/tech/123/123.png
  zoom: # 图片大小，例如填写 50% 表示原图像的一半大小
  caption: "" #图片底部描述
  alt: ""
  relative: false
---

# 240. 搜索二维矩阵Ⅱ

题目：https://leetcode.cn/problems/search-a-2d-matrix-ii/



## 思路：

个人的思路是通过一个递归的过程，查找规律实现的，具体为：先尽可能向右找，向右找不到就向下找，向下找不到就向左找，如果还是找不到就说明没有这个值。



灵神的思路是利用排除法，可以通过下面的图片理解。

![lc240.png](https://raw.githubusercontent.com/lidianzhong/astro-blog/refs/heads/edit/src/content/blog/algorithm/240-search-a-2d-matrix-ii/1716183468-zVwElx-lc240.png)

## 代码

以下为个人版本的，要注意**当尝试往右走时要排除之前就是从左边过来的情况**

```cpp
class Solution {
private:
    bool vaild(vector<vector<int>>& matrix, int i, int j, int target) {
        int m = matrix.size(), n = matrix[0].size();
        if (i >= 0 && i < m && j >= 0 && j < n && matrix[i][j] <= target) { return true; }
        return false;
    }

public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();

        int i = 0, j = 0;
        int last = 0; // 右1, 下2, 左3, 上4

        while (true) {
            if (matrix[i][j] == target) { return true; }
            else if (matrix[i][j] > target) { return false; }
            else { // 尝试走下一步
                if (last != 3 && vaild(matrix, i, j + 1, target)) { j = j + 1; last = 1; } // 尝试往右走
                else if (vaild(matrix, i + 1, j, target)) { i = i + 1; last = 2; } // 尝试往下走
                else if (vaild(matrix, i, j - 1, target)) { j = j - 1; last = 3; } // 尝试往左走
                else { return false; } //  表明找不到目标值
            }
        }
    }
};
```



以下为灵神版本的：

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int i = 0; 
        int j = matrix[0].length - 1;
        while (i < matrix.length && j >= 0) {
            if (matrix[i][j] == target) {
                return true;
            }
            if (matrix[i][j] < target) {
                i++;
            } else {
                j--;
            }
        }
        return false;
    }
}
```

