# 41. 缺失的第一个正数

题目：[https://leetcode.cn/problems/first-missing-positive/](https://leetcode.cn/problems/first-missing-positive/)

## 思路

这里要求 O(1) 的空间复杂度来解决这道图，说明不能自己创建状态数组来记录，这说明了**要寻找自身的信息**。这道题的额外信息是：**利用数组的下标来记录信息**。将 i 处的值与 nums[i] 处的值呼唤，说明了：**nums[i] 这个值在 nums 是存在的**。

## 代码（哈希思想）、

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        // 1. 不符合条件的 (<=0) 都改为 n+1
        // 2. 如果数 num 存在，那么第num个位置数字为负，否则为正
        // 3. 数的位置大于0的数，这个数字不存在，就是答案，否则为 n+1
        int n = nums.size();
        for (auto& num : nums) {
            if (num <= 0) {
                num = n + 1;
            }
        }

        for (int i = 0; i < n; i++) {
            int x = abs(nums[i]);
            if (x <= n) {
                nums[x - 1] = -abs(nums[x - 1]);
            }
        }
        
        for (int i = 1; i <= n; i++) {
            if (nums[i - 1] >= 0) return i;
        }

        return n + 1;
    }
};
```

---

## 代码（交换座位的思想）

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