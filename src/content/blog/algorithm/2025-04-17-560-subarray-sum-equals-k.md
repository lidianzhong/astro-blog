---
title: "560.和为k的子数组"
published: 2025-04-17
lastmod: 2025-04-17
category: "算法"
tags: ["算法", "Leetcode"]
description: '给你一个整数数组 nums 和一个整数 k ，请你统计并返回 该数组中和为 k 的子数组的个数 。'

weight: 560
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

# 560. 和为 K 的子数组

题目：https://leetcode.cn/problems/subarray-sum-equals-k/



## 思路

思考本道题能不能使用双指针：

答：不能。因为在指针移动的时候，不满足单调性。具体地，如果想要让选中序列的值变大，右指针往右移动，或者左指针往左移动，都可能可以，所以这道题不能使用双指针。



思考本道题使用的方法：

答：前缀和。因为题目要求是和的值，并且数组是连续的，所以考虑前缀和。



本题的解题思路：

**求数组中 `和为k的子数组` 的个数，转化为求前缀和数组中，`两个数差为k` 的个数**，针对计算两个数差为k的个数这个问题，考虑**两数之和**题目的思路（s[i] - k在哈希表中是否存在）。



## 解答

### 方法：前缀和

需要考虑两种特殊情况：

1. 哈希表中要预先放一个 `0出现了一次`这个信息。例子：[1,1,1], k = 2
2. 如果某个数出现了多次，那么结果要加这个次数，而不是加一。例子：[1,-1,0], k = 0



代码：

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int n = nums.size();

        int ans = 0;
        unordered_map<int, int> umap;

        vector<int> s;
        s.resize(n + 1);
        partial_sum(nums.begin(), nums.end(), s.begin() + 1);

        umap[0] = 1; 

        for (int i = 1; i <= n; i++) {
            if (umap.find(s[i] - k) == umap.end()) {
                umap[s[i]]++;
            } else {
                ans+=umap[s[i] - k];
                umap[s[i]]++;
            }
        }

        return ans;
    }
};
```

