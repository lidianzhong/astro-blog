---
title: "76. 最小覆盖子串"
published: 2025-04-23
lastmod: 2025-04-23
category: "算法"
tags: ["算法", "Leetcode"]
description: '给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。'
weight: 76
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

# 76. 最小覆盖子串

题目：https://leetcode.cn/problems/minimum-window-substring/



## 思路：

> 原始想法：确定一个滑动窗口，滑动窗口需要满足：子字符串中的字符数量大于等于 t 中的字符数量。如果当前滑动窗口不满足条件，那么右窗口右移，直到满足条件。当满足条件后，左窗口右移，直到丢掉一个子字符串的元素，使得滑动窗口条件不满足，这时候再判断滑动窗口是否满足条件，如果不满足，那么右窗口右移，直到结束。
>
> 伪代码：
>
> - left = 0，right = 0
> - while right < n:
>   - check
>   - if true
>     - ans  = min(ans, (j - i + 1))
>     - left 一直右移到下一个子串元素
>   - if false
>     - right < n && right 一直右移到下一个子串元素



## 代码

自己写的代码（cpp）：

```cpp
class Solution {
    public:
        string minWindow(string s, string t) {
            int sn = s.size(), tn = 0;
    
            int q[100] = {0};
            for (auto item : t) {
                if (q[item - 'A'] == 0) {
                    tn++;
                }
                q[item - 'A']++;
            }
    
            int start = 0, res = INT_MAX;
    
            int count = 0;
            int arr[100] = {0};
    
            int left = 0, right = -1;
            // left 找到第一个符合条件的元素
            while (left < sn && q[s[left] - 'A'] == 0) {
                left++;
            }
            if (left == sn) {
                return ""; // 如果没有符合条件的子串，返回空字符串
            }
    
            while (right < sn) {
                // check 检查是否满足滑动窗口的条件
                if (count >= tn) {
                    // 记录答案
                    if (right - left + 1 <= res) {
                        start = left;
                        res = right - left + 1;
                    }
                    // left 移向下一个子串元素
                    if (arr[s[left] - 'A'] == q[s[left] - 'A']) {
                        count--;
                    }
                    arr[s[left] - 'A']--;
                    do {
                        left++;
                    } while (left < sn && q[s[left] - 'A'] == 0);
                } else {
                    // right 移向下一个子串元素
                    do {
                        right++;
                    } while (right < sn && q[s[right] - 'A'] == 0);
                    if (right < sn) {
                        if (arr[s[right] - 'A'] == q[s[right] - 'A'] - 1) {
                            count++;
                        }
                        arr[s[right] - 'A']++;
                    }
                }
            }
    
            if (res == INT_MAX) {
                return ""; // 如果没有符合条件的子串，返回空字符串
            } else {
                return s.substr(start, res); // 返回符合条件的子串
            }
        }
    };

```

