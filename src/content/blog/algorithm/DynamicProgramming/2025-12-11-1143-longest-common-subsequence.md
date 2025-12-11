# 1143.最长公共子序列

题目：[https://leetcode.cn/problems/longest-common-subsequence](https://leetcode.cn/problems/longest-common-subsequence)

## 思路

有时候就太胆小了，不敢去做……

首先，看题干描述，《最长》、《子序列》，很容易想到它是一道动态规划题目。并且容易想到可以使用子集型回溯来思考。采用回溯三问来思考，当前操作：s[i] 和 t[j] 选或不选，子问题：s 的前 i 个字母和 t 的前 j 个字母的 LCS 长度，下一个子问题：s 的前 i-1 个字母和 t 的前 j 个字母的 LCS 长度、s 的前 i 个字母和 t-1 的前 j 个字母的 LCS 长度、s 的前 i-1 个字母和 t-1 的前 j 个字母的 LCS 长度。然后得到递推关系式，根据 s[i] 和 t[j] 是否相等来判断。

可以得到回溯代码

```cpp
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.length();
        int n = text2.length();
        auto dfs = [&](this auto&& dfs, int i, int j) -> int {
            if (i < 0 || j < 0) {
                return 0;
            }
            if (text1[i] != text2[j]) {
                return max(dfs(i - 1, j), dfs(i, j - 1));
            } else {
                return dfs(i - 1, j - 1) + 1;
            }
        };
        return dfs(m - 1, n - 1);
    }
};
```

回溯 + 记忆化搜索

```cpp
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.length();
        int n = text2.length();
        vector memo(m, vector<int>(n, -1));

        auto dfs = [&](this auto&& dfs, int i, int j) -> int {
            if (i < 0 || j < 0) {
                return 0;
            }

            int& res = memo[i][j];
            if (res != -1) {
                return res;
            }

            if (text1[i] != text2[j]) {
                return res = max(dfs(i - 1, j), dfs(i, j - 1));
            } else {
                return res = dfs(i - 1, j - 1) + 1;
            }
        };
        return dfs(m - 1, n - 1);
    }
};
```

动态规划 ~

```cpp
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.length();
        int n = text2.length();
        vector memo(m, vector<int>(n, -1));

        vector<vector<int>> f(m + 1, vector<int>(n + 1));

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (text1[i] != text2[j]) {
                    f[i + 1][j + 1] = max(f[i][j + 1], f[i + 1][j]);
                } else {
                    f[i + 1][j + 1] = f[i][j] + 1;
                }
            }
        }
        return f[m][n];
    }
};
```