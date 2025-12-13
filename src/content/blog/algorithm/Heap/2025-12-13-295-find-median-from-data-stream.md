# 295.数据流的中位数

题目：[https://leetcode.cn/problems/find-median-from-data-stream](https://leetcode.cn/problems/find-median-from-data-stream)

## 思路

简单来想，要时时刻刻拿到一组数据的中位数，那么我们随时将这些数据分为两半，最小的那一堆，最大的那一堆。然后答案就是要不是其中一个堆顶的元素，要不是两个堆顶元素的平均值。

规定，比较小的那一堆允许多一个元素。那么我们就需要在小的中找最大值，大的中找最小值。小的用最大堆，大的用最小堆。当有一个元素来的时候，我们需要看丢到哪个里面，然后平衡两者的数量，要不 left == right，要不 left + 1 == right。技巧：总是丢到能破环平衡的一方，然后无脑调整。比如，在 left == right 时，将来的元素丢到 right 里，然后一定触发调整；在 left + 1 == right 时，将来的元素丢到 left 里，然后一定触发调整。

注意：最大堆是 priority_queue<int, vector<int>, less<>> left，最小堆换成 greator<> 即可。

```cpp
class MedianFinder {
public:
    priority_queue<int, vector<int>, less<>> left; // 最大堆
    priority_queue<int, vector<int>, greater<>> right; // 最小堆
    
    void addNum(int num) {
        if (left.size() == right.size()) {
            right.push(num);
            left.push(right.top());
            right.pop();
        } else {
            left.push(num);
            right.push(left.top());
            left.pop();
        }
    }
    
    double findMedian() {
        if (left.size() == right.size()) {
            return (left.top() + right.top()) / 2.0;
        } else {
            return left.top();
        }
    }
};
```