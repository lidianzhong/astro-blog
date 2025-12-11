# 24.两两交换链表中的节点

题目：[https://leetcode.cn/problems/swap-nodes-in-pairs](https://leetcode.cn/problems/swap-nodes-in-pairs)

## 思路

理解起来并不难，在编写代码上会有些麻烦，需要背好模板。首先，得有添加 dummy 节点的好习惯，其次我们规定：pre 和 nxt 为交换节点的前一个和后一个，head 和 tail 为交换节点的头节点和尾节点。交换节点函数遵循一套规则，返回值和主链表接起来遵循一套规则，切到下一块节点遵循一套规则。

```cpp
class Solution {
public:
    pair<ListNode*, ListNode*> swapNode(ListNode* head, ListNode* tail) {
        head->next = tail->next; // 处理好头和尾
        tail->next = head;
        return {tail, head};
    }

    ListNode* swapPairs(ListNode* head) {
        
        ListNode dummy(0, head);
        ListNode* pre = &dummy;

        while (head) {
            // 对外只有 pre 和 head

            // 产生 tail 和 nxt
            ListNode* tail = pre;
            for (int i = 0; i < 2; i++) {
                tail = tail->next;
                if (tail == nullptr) return dummy.next;
            }
            ListNode* nxt = tail->next;

            // 接起来
            auto res = swapNode(head, tail);
            head = res.first;
            tail = res.second;

            // 下一处
            pre->next = head;
            tail->next = nxt;
            pre = tail;
            head = nxt;
        }

        return dummy.next;
    }
};
```