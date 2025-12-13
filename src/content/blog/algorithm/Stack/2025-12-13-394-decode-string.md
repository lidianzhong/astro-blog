# 394.字符串解码

题目：[https://leetcode.cn/problems/decode-string](https://leetcode.cn/problems/decode-string)

## 思路

考虑当检测到 `[` 准备进入下一层需要考虑保存什么？需要重复的数字和当前拿到的字母（因为当我们进入下一层的时候，这些就拿不到了）。考虑检测到 `]` 我们处于什么状态？意味着当前层要结束了。我们要做的是：首先拿到这次在 `[` 之前拿到的字母 pre_res，然后重复 pre_k 次 res（`res`存储的是括号**内部**刚刚处理完的字符串），作为新的 res。接着准备迎接后续的字符或下一层右括号。

```cpp
class Solution {
public:
    string decodeString(string s) {
        
        stack<pair<string, int>> stk;

        string res;
        int k = 0;
        for (auto& c : s) {
            if (isdigit(c)) {
                k = k * 10 + c - '0';
            } else if (isalpha(c)) {
                res += c;
            } else if (c == '[') {
                stk.push({move(res), k});
                k = 0;
            } else if (c == ']') {
                auto [pre_res, pre_k] = stk.top();
                stk.pop();

                while (pre_k--) {
                    pre_res += res;
                }
                res = move(pre_res);
            }
        }
        return res;
    }
};
```