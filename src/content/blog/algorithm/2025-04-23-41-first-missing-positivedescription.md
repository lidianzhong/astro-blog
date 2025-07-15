---
title: "41. 缺失的第一个正数"
published: 2025-04-23
lastmod: 2025-04-23
category: "算法"
tags: ["算法", "Leetcode"]
description: '给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。'
weight: 189
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

# 41. 缺失的第一个正数

题目：https://leetcode.cn/problems/first-missing-positive/



## 思路

原先的思路：没有。。。

这里要求 O(1) 的空间复杂度来解决这道图，说明不能自己创建状态数组来记录，这说明了**要寻找自身的信息**。这道题的额外信息是：**利用数组的下标来记录信息**。将 i 处的值与 nums[i] 处的值呼唤，说明了：**nums[i] 这个值在 nums 是存在的**。



## 代码

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();

        int idx = 0;
        while (idx < n) {
            if (nums[idx] > 0 && nums[idx] <= n) {
                if (nums[idx] == idx + 1) { // 已经在正确的位置上
                    idx++;
                } else {
                    if (nums[nums[idx] - 1] != nums[idx]) { // 只有在不相等时才交换
                        std::swap(nums[idx], nums[nums[idx] - 1]);
                    } else {
                        idx++;
                    }
                }
            } else {
                idx++;
            }
        }

        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) { return i + 1; } // 找到第一个不等于 i + 1 的位置
        }

        return n + 1;
    }
};
```

可以对上面的代码进行一些化简（虽然并没有什么用，而且可读性更差了）

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();

        int idx = 0;
        while (idx < n) {
            if ((nums[idx] > 0 && nums[idx] <= n) && nums[idx] != nums[nums[idx] - 1]) {
                std::swap(nums[idx], nums[nums[idx] - 1]);
            } else {
                idx++;
            }
        }

        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) { return i + 1; } // 找到第一个不等于 i + 1 的位置
        }

        return n + 1;
    }
};
```

