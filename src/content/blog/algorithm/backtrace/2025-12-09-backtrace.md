# 回溯

回溯像一种遍历，只不过它的遍历和 for 循环遍历不太一样。回溯的目的是为了枚举出所有可能的情况。在枚举出所有可能的情况的过程中，虽然我们达到最后枚举所有可能的结果相同，但我们在不同的视角下枚举的方式可能不同，可以通过下面的例子感受之。

对于回溯问题，有**选或不选**和**选哪个**这两种思路。



## 题目描述

 给你一个整数数组 `nums`，数组中的元素互不相同 。返回该数组所有可能的子集（幂集）。解集不能包含重复的子集。

例如：`nums = [1, 2, 3]`



### 思路1：选或不选

我们的目的是——枚举出所有满足题目要求的答案。

容易想到——如果我们手里拿着 123 卡片，将卡片打到桌上算作答案，那么卡片1有打或者不打两个情况，2，3同理，所以可能的结果就有 2×2×2=8 种。

归纳一下——我们站在元素的视角，根据元素的状态情况（选或不选），枚举得到答案。



### 思路2：选哪个

我们的目的是——枚举出所有满足题目要求的答案。

容易想到——找一个摄影机对着桌子，每操作一下就拍摄一次，拍摄的结果立即加入答案。流程可能是，空桌子拍摄一下，放入卡片1拍摄一下，而后放入卡片2（此时桌面有1，2）拍摄一下，而后放入卡片3（此时桌面有1，2，3）拍摄一下……接下来桌子只有卡片2拍摄一下，而后放入卡片3（此时桌面有2，3）拍摄一下。接下来桌子只有卡片3拍摄一下。

归纳一下——每一步都是答案，结果不是最后才出来。出现一个新的答案不需要看全局，只尽量枚举当时可选的情况。



## 附录

### 代码1

```cpp
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        
        int n = nums.size();
        vector<int> path;
        vector<vector<int>> ans;

        auto dfs = [&](this auto&& dfs, int i) -> void {

            if (i == n) {
                ans.push_back(path);
                return;
            }

            // y
            path.push_back(nums[i]);
            dfs(i + 1);
            path.pop_back();

            // n
            dfs(i + 1);
        };

        dfs(0);
        return ans;
    }
};
```

### 代码2

```cpp
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        
        int n = nums.size();
        vector<int> path;
        vector<vector<int>> ans;

        auto dfs = [&](this auto&& dfs, int i) -> void {

            ans.push_back(path);

            for (int j = i; j < n; j++) {
                path.push_back(nums[j]);
                dfs(j + 1);
                path.pop_back();
            }
        };

        dfs(0);
        return ans;
    }
};
```