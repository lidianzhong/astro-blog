---
title: "239. 滑动窗口最大值"
published: 2025-04-21
lastmod: 2025-04-21
category: "算法"
tags: ["算法", "Leetcode"]
description: '给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。返回滑动窗口中的最大值 。'
weight: 239
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

# 239. 滑动窗口最大值

题目：https://leetcode.cn/problems/sliding-window-maximum/



## 思路：

> 原始想法：因为要求最大值，而在暴力做法中存在冗余计算的情况，所以考虑减少冗余计算来优化算法的思想。但观察到每次移动一格，滑动窗口会添加或者丢弃一个数，所以很难找到“最大值块”，以减少计算……

因为要求最大值，并且有临近关系，且可以观察到会往一个部分持续添加一个数或者减少一个数，所以算法的结果可能是维护一个数据接口，然后通过加入一个值或者减少一个值，并更新其中的最大值作为答案。

正确思路是，注意到**滑动窗口中一个更小的数且更早进入的数是不可能成为最大值的**，于是我们将不合适的数剔除，就可以发现维护的数组是单调递减的，又由于在头尾加元素丢元素，于是这个数据结构便是单调队列。

<br>

> 原始伪代码：
>
> ① 指针 i 从 0 遍历到 k-1，如果发现之前出现的数有小于等于 i 处的值，就剔除掉，然后将该数和下标加入队列。
>
> ② 指针 i 从 k 到 n-1，首先将*超过队列长度的数字剔除*（如果第一个数在滑动窗口外边，就去掉），然后将*队列中小于等于 i 处的值的数剔除掉*，然后将该数和下标加入队列，然后记录当前队列的尾部的值。

注意到，① 方法可以改为在 i >= k-1 时开始记录答案，② 中剔除可以从队列尾部剔除，且只需要将下标记录在队列中即可

<br>

正确伪代码：

遍历 nums 数组
1. 入

如果队列不为空且队列最后一个元素小于等于 nums[i]，那么就剔除, 然后将 nums[i] 加入队列

2. 出

如果第一个元素已经超过滑动窗口范围了，就剔除掉

3. 记录答案

如果 i >= k-1 时，记录答案



## 解答

### 方法：单调队列

```python
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        ans = []
        q = deque()
        for i, x in enumerate(nums):
            # 1. 入
            while q and nums[q[-1]] <= x:
                q.pop()
            q.append(i)
            # 2. 出
            if i - q[0] >= k:
                q.popleft()
            # 3. 记录答案
            if i >= k - 1:
                ans.append(nums[q[0]])
        return ans
```

