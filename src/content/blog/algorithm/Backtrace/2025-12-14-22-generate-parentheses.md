# 22.括号生成

题目：[https://leetcode.cn/problems/generate-parentheses](https://leetcode.cn/problems/generate-parentheses)

## 思路

这道题首先可以看出来是排列型回溯。如果我们使用选或不选的方法，也是就在 2 * n 的左括号数组中，填充三个为右括号，然后在 i == n 时判断括号数量是否匹配，是否满足永远右括号数量大于左括号数量即可。这个过程有点麻烦。

所以我们可以考虑在过程中给予约束，我们在过程中保证：1.左括号数量小于n 2.右括号数量大于左括号数量，这样当 i == n 的时候，直接就是符合条件的答案。

这两种方法中，第一种 i 表示位置，第二种 dfs(left, right) 表示目前填了 left 个左括号，right 个右括号（当然你也可以理解为在枚举每个右括号， left为辅助的值）。

```cpp
class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> ans;
        string path(2 * n, 0);

        auto dfs = [&](this auto&& dfs, int left, int right) {
            if (n == right) {
                ans.push_back(path);
                return;
            }

            if (left < n) {
                path[left + right] = '(';
                dfs(left + 1, right);
            }
            if (left > right) {
                path[left + right] = ')';
                dfs(left, right + 1);
            }
        };

        dfs(0, 0);
        return ans;
    }
};
```