# 300.最长递增子序列

题目：[https://leetcode.cn/problems/longest-increasing-subsequence](https://leetcode.cn/problems/longest-increasing-subsequence/)



## 思路

我们需要对递推表达式有个清晰的认识，当我们确定，dfs(i) 表示，从数组下标 i 开始往后，看到能构成的最长递增子序列长度。当不考虑第 i 个元素，dfs(i) 的结果为 dfs(i+1) 的结果；当考虑第 i 个元素，dfs(i) 的结果为 dfs(i+1) ~ dfs(n-1) 中所有满足开头大于 nums[i]  的最大值。

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        int n = nums.size();

        auto dfs = [&](this auto&& dfs, int i) -> int {
            if (i == n) {
                return 0;
            }

            int not_take = dfs(i + 1);

            int take = 1;
            int best_next = 0;

            for (int j = i + 1; j < n; j++) {
                if (nums[j] > nums[i]) {
                    best_next = max(best_next, dfs(j));
                }
            }

            take += best_next;

            return max(take, not_take);
        };
        
        return dfs(0);
    }
};
```

跟上面一样的思路，我们可以写一个递减的版本。我们规定，dfs(i) 表示，从开头到第 i 个元素，看到能构成的最长递增子序列长度。

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        int n = nums.size();

        auto dfs = [&](this auto&& dfs, int i) -> int {
            if (i < 0) {
                return 0;
            }

            int not_take = dfs(i - 1);

            int take = 1;
            int best_next = 0;

            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    best_next = max(best_next, dfs(j));
                }
            }

            take += best_next;

            return max(take, not_take);
        };
        
        return dfs(n - 1);
    }
};
```

> 以下思路不是选或不选，而是选哪个，我很难理解他们的区别……

我们尝试将回溯改为递推，f[i] 表示，从开头到第 i 个元素，看到能构成的最长递增子序列长度。f[i] 可以从 f[i-1]（不选）和 f[0…i-1]（选） 转移过来。这两个条件可以合并，最后化简为：f[i] 的值为 f[0…i-1] 中最大值+1，以及和1，取最大值。

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        int n = nums.size();
        vector<int> f(n);

        for (int i = 0; i < n; i++) {
            f[i] = 1;
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    f[i] = max(f[i], f[j] + 1);
                }
            }
        }

        return *max_element(f.begin(), f.end());
    }
};
```

> 以下为错误思路，仅保留

根据常规考虑DP的思路，我们考虑递推表达式。当不选第 i 个元素时，很显然，dfs(i) 等于 dfs(i - 1) 的结果；当选择第 i 个元素时，dfs(i) 应该是——不大于nums[i]对应的 dfs 结果。根据规律，采用单调栈……