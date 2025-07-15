---
title: "53. 最大子数组和"
published: 2025-04-23
lastmod: 2025-04-23
category: "算法"
tags: ["算法", "Leetcode"]
description: '给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。'
weight: 53
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

# 53. 最大子数组和

题目：https://leetcode.cn/problems/maximum-subarray/



## 思路：

> 原始思路：最初这个子数组为 nums 中所有元素，然后如果左边的缩减能让子数组变大，那么就缩减；右边同理。
>
> 这样的考虑是欠缺的，因为不知道哪个数会被包含其中，且边界问题无法解决。

正确思路：

- 这道题要求的是**连续**，而且题目只要求返回结果，而不是求最大连续子数组是哪一个。由以上条件可以推出本道题通常可以使用**动态规划**解决。
- 题目要求出最大和的连续子数组，但不知道是包含哪个数的最大和的连续子数组，那么我们只要求出**对于每一个数的最大和的连续子数组**就可以了。
- 但当前设定存在**有后效性**，意思就是说，**不确定这个数属于连续子数组的第几个元素**。于是，我们重新定义，改为：**以每一个数结尾的最大和的连续子数组**。
- 观察第 i 个子问题和第 i+1 个子问题，可以发现：**如果以 i 结尾的最大连续子数组小于等于 0，那么以 i+1 结尾的最大连续子数组等于第 i 个值**
- 于是本道动态规划题定义如下：
  - 定义状态：dp[i]：表示以 nums[i] 结尾的连续子数组的最大值。
  - 状态转移方程：
    - 如果 dp[i - 1] > 0，那么可以把 nums[i] 直接接在 dp[i - 1] 表示的那个数组的后面，得到和更大的连续子数组；
    - 如果 dp[i - 1] <= 0，那么 nums[i] 加上前面的数 dp[i - 1] 以后值不会变大。于是 dp[i] 「另起炉灶」，此时单独的一个 nums[i] 的值，就是 dp[i]。
  - 结果：结果为 dp 数组中的最大值



### 优化

因为最后要求的是最大值，那么状态转移方程可以是：`dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);`

其次，结果中求最大值的过程可以在状态转移中求出

最后，第 i 次的状态只和 i - 1 次有关，所以可以节省一点空间。



## 代码

### 动态规划

基础版

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int len = nums.length;

        int[] dp = new int[len];
        dp[0] = nums[0];

        for (int i = 1; i < len; i++) {
            if (dp[i - 1] > 0) {
                dp[i] = dp[i - 1] + nums[i];
            } else {
                dp[i] = nums[i];
            }
        }

        int res = dp[0];
        for (int i = 1; i <  len; i++) {
            res = Math.max(res, dp[i]);
        }
        return res;
    }
}
```

优化版

```java
public class Solution {

    public int maxSubArray(int[] nums) {
        int pre = 0;
        int res = nums[0];
        for (int num : nums) {
            pre = Math.max(pre + num, num);
            res = Math.max(res, pre);
        }
        return res;
    }
}
```

