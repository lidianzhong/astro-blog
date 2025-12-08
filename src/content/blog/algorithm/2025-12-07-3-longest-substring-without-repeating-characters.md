# 3.无重复字符的最长子串

题目：[https://leetcode.cn/problems/longest-substring-without-repeating-characters](https://leetcode.cn/problems/longest-substring-without-repeating-characters)

## 思路

双指针

## 代码

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.length();
        if (n == 0) return 0;
        
        unordered_set<int> uset;

        int ans = 1;
        int left = 0;
        for (int right = 0; right < n; right++) {
            if (uset.find(s[right]) != uset.end()) {
                while (s[left] != s[right]) {
                    uset.erase(s[left]);
                    left++;
                }
                left++;
            } else {
                uset.insert(s[right]);
            }

            ans = max(ans, right - left + 1);
        }

        return ans;
    }
};
```