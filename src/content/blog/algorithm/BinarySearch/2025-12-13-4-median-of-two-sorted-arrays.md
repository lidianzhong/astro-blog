# 4.寻找两个正序数组的中位数

题目：[https://leetcode.cn/problems/median-of-two-sorted-arrays](https://leetcode.cn/problems/median-of-two-sorted-arrays)

视频：[https://www.bilibili.com/video/BV1ss5xzAEwR](https://www.bilibili.com/video/BV1ss5xzAEwR)

## 思路
1. 确定 i 和 j 的含义
2. 确定中位数结果的表达式
3. 得到符合条件的 i 和 j 的不等式
4. 只根据 i 来得到 i 和 j
5. 二分查找得到 i

注意 i 是从 [0…m]，理由是根据绳长范围确定 i 范围；注意特判，左边界为负无穷，右边界为正无穷；注意中位数结果为两个左边取最大或者平均一下两个左边取最大和两个右边取最小；注意符合条件为：`left1 <= right2 && left2 <= right`。

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) {
            return findMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.size();
        int n = nums2.size();

        int left = 0, right = m;
        while (left <= right) {
            int i = (left + right) / 2;
            int j = (m + n + 1) / 2 - i;

            int left1 = (i == 0) ? INT_MIN : nums1[i - 1];
            int right1 = (i == m) ? INT_MAX : nums1[i];
            int left2 = (j == 0) ? INT_MIN : nums2[j - 1];
            int right2 = (j == n) ? INT_MAX : nums2[j];

            if (left1 <= right2 && left2 <= right1) {
                if ((m + n) % 2 == 1) {
                    return max(left1, left2);
                } 
                return (max(left1, left2) + min(right1, right2)) / 2.0;
            } else if (left1 > right2) {
                right = i - 1;
            } else {
                left = i + 1;
            }
        }
        return 0;
    }
};
```