# 169.多数元素

题目：[https://leetcode.cn/problems/majority-element](https://leetcode.cn/problems/majority-element)

## 思路

当 count = 0 时，下一个 res 必须为 nums[i]

```cpp
class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int res = INT_MAX;
        int count = 0;

        for (auto& num : nums) {
            if (count == 0) {
                res = num;
                count = 1;
                continue;
            }

            if (res == num) count++;
            else count--;
        }

        return res;
    }
};
```