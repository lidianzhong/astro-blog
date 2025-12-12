# 56. 合并区间

题目：[https://leetcode.cn/problems/merge-intervals](https://leetcode.cn/problems/merge-intervals/) 

## 思路

很容易发现，这道题可以用遍历的方式来做。既然是遍历，那可以只考虑前 i 个，当拿到一个新的 intervals[i] 时，用它和之前维护的变量进行处理。注意排序，注意要加上最后一个节点。

> **错误思路**
> 
> 先遍历一遍 intervals 数组，然后在范围中的值都标记为已涵盖，然后第二次遍历依次收集即可。
> 
> 出现问题，边界问题处理不了。。。
> 
> 正确思路：先按左端点排序，然后收集即可。

## 代码

c++ 版本

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        ranges::sort(intervals.begin(), intervals.end());
        
        int n = intervals.size();
        vector<vector<int>> ans;

        int start = intervals[0][0];
        int end = intervals[0][1];

        for (int i = 1; i < n; i++) {
            int a = intervals[i][0];
            int b = intervals[i][1];
            if (a <= end) {
                end = max(end, b);
            } else {
                ans.push_back({start, end});
                start = a;
                end = b;
            }
        }
        ans.push_back({start, end});

        return ans;
    }
};
```

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        ranges::sort(intervals);

        vector<vector<int>> ans;
        for (auto& p : intervals) {
            if (!ans.empty() && p[0] <= ans.back()[1]) {
                ans.back()[1] = max(ans.back()[1], p[1]);
            } else {
                ans.emplace_back(p);
            }
        }
        return ans;
    }
};

```

java 版本

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (p, q) -> p[0] - q[0]); // 按照左端点从小到大排序
        List<int[]> ans = new ArrayList<>();
        for (int[] p : intervals) {
            int m = ans.size();
            if (m > 0 && p[0] <= ans.get(m - 1)[1]) { // 可以合并
                ans.get(m - 1)[1] = Math.max(ans.get(m - 1)[1], p[1]); // 更新右端点最大值
            } else { // 不相交, 无法合并
                ans.add(p); // 新的合并区间
            }
        }
        return ans.toArray(new int[ans.size()][]);
    }
}

```