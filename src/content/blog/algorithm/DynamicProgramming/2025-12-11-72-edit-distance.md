# 72.编辑距离

题目：[https://leetcode.cn/problems/edit-distance](https://leetcode.cn/problems/edit-distance)

## 思路

最难的是得到这个递推方程式，具体可以看 [最长公共子序列 编辑距离【基础算法精讲 19】](https://www.bilibili.com/video/BV1TM4y1o7ug/?sharesource=copyweb&vd_source=2cd9f633b54713a97294da72965cd194&t=485)

注意这里的边界条件，当 i=0 时，需要操作 j+1 次；当 j=0 时，需要操作 i+1 次。

回溯写法

```cpp
class Solution {
public:
    int minDistance(string word1, string word2) {
        int n = word1.length(), m = word2.length();
        auto dfs = [&](this auto&& dfs, int i, int j) -> int {
            if (i < 0) {
                return j + 1;
            }
            if (j < 0) {
                return i + 1;
            }
            if (word1[i] == word2[j]) {
                return dfs(i - 1, j - 1);
            }
            return min({dfs(i, j - 1), dfs(i - 1, j), dfs(i - 1, j - 1)}) + 1;
        };
        return dfs(n - 1, m - 1);
    }
};
```

回溯写法+记忆化搜索

```cpp
class Solution {
public:
    int minDistance(string word1, string word2) {
        int n = word1.length(), m = word2.length();
        vector memo(n, vector<int>(m, -1));

        auto dfs = [&](this auto&& dfs, int i, int j) -> int {
            if (i < 0) {
                return j + 1;
            }
            if (j < 0) {
                return i + 1;
            }
            
            int& res = memo[i][j];
            if (res != -1) {
              return res;
            }

            if (word1[i] == word2[j]) {
                return res = dfs(i - 1, j - 1);
            }
            return res = min({dfs(i, j - 1), dfs(i - 1, j), dfs(i - 1, j - 1)}) + 1;
        };
        return dfs(n - 1, m - 1);
    }
};
```

回溯改为递推

```cpp
class Solution {
public:
    int minDistance(string word1, string word2) {
        int n = word1.length(), m = word2.length();
        vector f(n + 1, vector<int>(m + 1));

        for (int i = 0; i < n; i++) {
          f[i + 1][0] = i + 1;
        }
        for (int j = 0; j < m; j++) {
          f[0][j + 1] = j + 1;
        }

        for (int i = 0; i < n; i++) {
          for (int j = 0; j < m; j++) {
            if (word1[i] == word2[j]) {
              f[i + 1][j + 1] = f[i][j];
            } else {
              f[i + 1][j + 1] = min({f[i + 1][j], f[i][j + 1], f[i][j]}) + 1;
            }
          }
        }

        return f[n][m];
    }
};
```