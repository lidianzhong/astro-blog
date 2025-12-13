# 49. 字母异位词分组

题目：[https://leetcode.cn/problems/group-anagrams](https://leetcode.cn/problems/group-anagrams)

## 解答

### 方法一：先排序后归类

思路：先将每个字母进行排序，方便后续的遍历。接下来的步骤就是如何将一样的字符串放在一起了。可以利用map的key，自动将相同内容归到一起。

代码：

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // sort
        vector<string> sorted_strs(strs);
        for (int i = 0; i < sorted_strs.size(); ++i) {
            std::sort(sorted_strs[i].begin(), sorted_strs[i].end());
        }

        // mapping
        unordered_map<string, vector<string>> hash_table;
        for (int i = 0; i < sorted_strs.size(); ++i) {
            hash_table[sorted_strs[i]].push_back(strs[i]); // <"aet", <"eat", "aet">>
        }

        // output
        vector<vector<string>> result;
        for (const auto& [_, value] : hash_table) {
            result.push_back(value);
        }
        
        return result;
    }
};

```

更简洁的代码：

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // sort & mapping
        unordered_map<string, vector<string>> hash_table;
        for (vector<string>::iterator it = strs.begin(); it != strs.end(); ++it) {
            string sorted_str = *it;
            sort(sorted_str.begin(), sorted_str.end()); 
            hash_table[sorted_str].push_back(*it); // <"aet", <"eat", "aet">>
        }

        // output
        vector<vector<string>> result;
        for (const auto& [_, value] : hash_table) {
            result.push_back(value);
        }
        
        return result;
    }
};

```

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> umap;
        for (auto& s : strs) {
            string s_sorted = s;
            ranges::sort(s_sorted);
            umap[s_sorted].push_back(s);
        }

        vector<vector<string>> ans;
        for (auto& [_, v] : umap) {
            ans.push_back(v);
        }
        return ans;
    }
};
```

### 方法二：尝试不排序直接归类

要想在排序的时候不归类，要让”字母异位词“能够自动作为相同的key归到一起。

民间代码（利用到了质数, 一些质数的乘积相同，那么这些质数一定相同）：

> 这里的 mul 累乘时会出现很大的数，所以以下C++代码并没有通过，使用python可以解决这个问题！

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        array<int, 26> alpha = {2,  3,  5,  7,  11, 13, 17, 19, 23,
                           29, 31, 37, 41, 43, 47, 53, 59, 61,
                           67, 71, 73, 79, 83, 89, 97, 101};

        unordered_map<long long, vector<string>> mp;

        for (string& str: strs) {
            long long mul = 1;
            for (char& s : str) {
                mul *= alpha[int(s) - int('a')];
            }
            mp[mul].emplace_back(str); // o(1) 插入
        }

        vector<vector<string>> ans;
        for (auto it = mp.begin(); it != mp.end(); ++it) {
            ans.emplace_back(it->second);
        }

        return ans;
    }
};

```

```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        # 如果一些质数的乘积相同，那么这些质数一定相同
        alpha = [2,  3,  5,  7,  11, 13, 17, 19, 23,
                 29, 31, 37, 41, 43, 47, 53, 59, 61,
                 67, 71, 73, 79, 83, 89, 97, 101]
        
        # 使用 defaultdict 来存储分组结果
        cnt = defaultdict(list)
        
        for s in strs:
            mul = 1
            for ch in s:
                # 计算质数乘积
                mul *= alpha[ord(ch) - ord('a')]
            # 将字符串添加到对应的分组
            cnt[mul].append(s)
        
        return list(cnt.values())

```

代码：

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // 自定义对 array<int, 26> 类型的哈希函数
        // key: array<int, 26> arr, 表示字母的频次
        // 使用 std::accumulate 对频次数组中的每个元素进行累加，生成一个哈希值。
        // 累加的过程中使用左移和异或操作来合并每个数字的哈希值，从而生成最终的哈希值。

        // fn = hash<int>{} 拿到整数的哈希计算函数, 用于 Lambda 中使用
        auto arrayHash = [fn = hash<int>{}] (const array<int, 26>& arr) -> size_t {
            return accumulate(arr.begin(), arr.end(), 0u, [&](size_t acc, int num) {
                return (acc << 1) ^ fn(num);
            });
        };

        unordered_map<array<int, 26>, vector<string>, decltype(arrayHash)> mp(0, arrayHash);
        for (string& str: strs) {
            array<int, 26> counts{};
            int length = str.length();
            for (int i = 0; i < length; ++i) {
                counts[str[i] - 'a'] ++;
            }
            mp[counts].emplace_back(str); // key: array<int, 26>, value: str
        }

        vector<vector<string>> ans;
        for (auto it = mp.begin(); it != mp.end(); ++it) {
            ans.emplace_back(it->second);
        }
        return ans;
    }
};

```