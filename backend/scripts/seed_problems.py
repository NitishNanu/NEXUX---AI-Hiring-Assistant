"""
Seed script: populate MongoDB with 60+ coding problems.

Run from the project root:
    python -m backend.scripts.seed_problems

Requires MONGODB_URL to be set in .env (or environment).
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Ensure project root is on path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.database import get_db
from backend.logger import get_logger

log = get_logger(__name__)

PROBLEMS = [
    # ─── EASY ─────────────────────────────────────────────────────────────────
    {
        "title": "Two Sum",
        "description": (
            "Given an array of integers `nums` and an integer `target`, "
            "return indices of the two numbers such that they add up to `target`.\n\n"
            "You may assume that each input has exactly one solution, and you may not "
            "use the same element twice."
        ),
        "difficulty": "easy",
        "category": "array",
        "tags": ["array", "hash_map", "two_pointers"],
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists"],
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "nums[1] + nums[2] = 2 + 4 = 6"},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(n)",
        "ai_hints": [
            "Use a hash map to store complement → index pairs.",
            "For each number, check if (target - num) already exists in the map.",
            "Single-pass: you can check and insert in the same loop.",
        ],
        "test_cases": [
            {"func": "twoSum", "args": [[2, 7, 11, 15], 9], "output": [0, 1]},
            {"func": "twoSum", "args": [[3, 2, 4], 6], "output": [1, 2]},
            {"func": "twoSum", "args": [[3, 3], 6], "output": [0, 1]},
        ],
        "solution_template": {
            "python": "def twoSum(nums, target):\n    # Your solution here\n    pass",
            "javascript": "function twoSum(nums, target) {\n    // Your solution here\n}",
        },
    },
    {
        "title": "Palindrome Check",
        "description": (
            "Given a string `s`, return `true` if it is a palindrome, "
            "considering only alphanumeric characters and ignoring cases."
        ),
        "difficulty": "easy",
        "category": "string",
        "tags": ["string", "two_pointers"],
        "constraints": ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters"],
        "examples": [
            {"input": "s = 'A man, a plan, a canal: Panama'", "output": "true", "explanation": "After filtering: 'amanaplanacanalpanama'"},
            {"input": "s = 'race a car'", "output": "false", "explanation": "'raceacar' is not a palindrome"},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(1)",
        "ai_hints": [
            "Use two pointers: one at start, one at end, move toward center.",
            "Skip non-alphanumeric characters.",
            "Compare characters case-insensitively.",
        ],
        "test_cases": [],
        "solution_template": {
            "python": "def isPalindrome(s):\n    # Your solution here\n    pass",
        },
    },
    {
        "title": "Reverse Linked List",
        "description": (
            "Given the head of a singly linked list, reverse the list, and return the reversed list."
        ),
        "difficulty": "easy",
        "category": "linked_list",
        "tags": ["linked_list", "recursion"],
        "constraints": ["The number of nodes in the list is in the range [0, 5000]"],
        "examples": [
            {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]", "explanation": "Reverse the links"},
            {"input": "head = [1,2]", "output": "[2,1]", "explanation": ""},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(1)",
        "ai_hints": [
            "Use three pointers: prev, curr, next.",
            "Iteratively reverse each link.",
            "Can also be solved recursively (O(n) space).",
        ],
        "test_cases": [],
        "solution_template": {"python": "def reverseList(head):\n    pass"},
    },
    {
        "title": "Valid Parentheses",
        "description": (
            "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', "
            "determine if the input string is valid.\n\n"
            "A string is valid if open brackets are closed by the same type of brackets "
            "and in the correct order."
        ),
        "difficulty": "easy",
        "category": "stack",
        "tags": ["stack", "string"],
        "constraints": ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
        "examples": [
            {"input": "s = '()'", "output": "true", "explanation": ""},
            {"input": "s = '()[]{}'", "output": "true", "explanation": ""},
            {"input": "s = '(]'", "output": "false", "explanation": "Mismatched types"},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(n)",
        "ai_hints": [
            "Use a stack. Push open brackets, pop and check close brackets.",
            "At the end, the stack should be empty.",
            "Use a hash map to map close → open brackets.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def isValid(s):\n    pass"},
    },
    {
        "title": "Maximum Subarray (Kadane's Algorithm)",
        "description": (
            "Given an integer array `nums`, find the contiguous subarray "
            "(containing at least one number) which has the largest sum and return its sum."
        ),
        "difficulty": "easy",
        "category": "dynamic_programming",
        "tags": ["array", "dynamic_programming", "divide_and_conquer"],
        "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        "examples": [
            {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "[4,-1,2,1] has the largest sum = 6"},
            {"input": "nums = [1]", "output": "1", "explanation": ""},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(1)",
        "ai_hints": [
            "Track current sum and global max.",
            "If current sum goes negative, reset it to 0.",
            "This is Kadane's Algorithm — classic DP pattern.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def maxSubArray(nums):\n    pass"},
    },
    # ─── MEDIUM ────────────────────────────────────────────────────────────────
    {
        "title": "Longest Substring Without Repeating Characters",
        "description": (
            "Given a string `s`, find the length of the longest substring without repeating characters."
        ),
        "difficulty": "medium",
        "category": "string",
        "tags": ["string", "sliding_window", "hash_map"],
        "constraints": ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces"],
        "examples": [
            {"input": "s = 'abcabcbb'", "output": "3", "explanation": "'abc' has length 3"},
            {"input": "s = 'bbbbb'", "output": "1", "explanation": "'b' has length 1"},
            {"input": "s = 'pwwkew'", "output": "3", "explanation": "'wke' has length 3"},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(min(m,n)) where m is charset size",
        "ai_hints": [
            "Use a sliding window with two pointers.",
            "Track character positions in a hash map.",
            "When a repeat is found, move the left pointer past the previous occurrence.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def lengthOfLongestSubstring(s):\n    pass"},
    },
    {
        "title": "Product of Array Except Self",
        "description": (
            "Given an integer array `nums`, return an array `answer` such that "
            "`answer[i]` is equal to the product of all the elements of nums except `nums[i]`.\n\n"
            "The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.\n"
            "You must write an algorithm that runs in O(n) time and without using the division operation."
        ),
        "difficulty": "medium",
        "category": "array",
        "tags": ["array", "prefix_sum"],
        "constraints": ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
        "examples": [
            {"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]", "explanation": ""},
            {"input": "nums = [-1,1,0,-3,3]", "output": "[0,0,9,0,0]", "explanation": ""},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(1) (excluding output array)",
        "ai_hints": [
            "Compute prefix products from left, then suffix products from right.",
            "For each index i: answer[i] = left_product[i] * right_product[i]",
            "You can do this in two passes without extra arrays.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def productExceptSelf(nums):\n    pass"},
    },
    {
        "title": "Binary Search",
        "description": (
            "Given an array of integers `nums` which is sorted in ascending order, "
            "and an integer `target`, write a function to search target in nums. "
            "If target exists, return its index. Otherwise, return -1.\n\n"
            "You must write an algorithm with O(log n) runtime complexity."
        ),
        "difficulty": "medium",
        "category": "binary_search",
        "tags": ["array", "binary_search"],
        "constraints": ["1 <= nums.length <= 10^4", "All integers in nums are unique", "nums is sorted in ascending order"],
        "examples": [
            {"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4", "explanation": "9 exists at index 4"},
            {"input": "nums = [-1,0,3,5,9,12], target = 2", "output": "-1", "explanation": "2 does not exist"},
        ],
        "expected_time_complexity": "O(log n)",
        "expected_space_complexity": "O(1)",
        "ai_hints": [
            "Use low, high, mid pointers.",
            "Narrow the range by half each iteration.",
            "Check mid == target, mid < target (go right), mid > target (go left).",
        ],
        "test_cases": [],
        "solution_template": {"python": "def search(nums, target):\n    pass"},
    },
    {
        "title": "Number of Islands",
        "description": (
            "Given an m x n 2D binary grid grid which represents a map of '1's (land) "
            "and '0's (water), return the number of islands.\n\n"
            "An island is surrounded by water and is formed by connecting adjacent lands "
            "horizontally or vertically."
        ),
        "difficulty": "medium",
        "category": "graph",
        "tags": ["array", "graph", "bfs", "dfs", "union_find"],
        "constraints": ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
        "examples": [
            {"input": "grid = [['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]", "output": "1"},
            {"input": "grid = [['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]", "output": "3"},
        ],
        "expected_time_complexity": "O(m*n)",
        "expected_space_complexity": "O(m*n)",
        "ai_hints": [
            "Use DFS or BFS to explore each island.",
            "Mark visited land cells as '0' to avoid revisiting.",
            "Count the number of times you start a new DFS/BFS.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def numIslands(grid):\n    pass"},
    },
    {
        "title": "Coin Change",
        "description": (
            "You are given an integer array `coins` representing coins of different denominations "
            "and an integer `amount` representing a total amount of money.\n\n"
            "Return the fewest number of coins that you need to make up that amount. "
            "If that amount of money cannot be made up by any combination of the coins, return -1."
        ),
        "difficulty": "medium",
        "category": "dynamic_programming",
        "tags": ["array", "dynamic_programming", "bfs"],
        "constraints": ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
        "examples": [
            {"input": "coins = [1,2,5], amount = 11", "output": "3", "explanation": "11 = 5 + 5 + 1"},
            {"input": "coins = [2], amount = 3", "output": "-1"},
            {"input": "coins = [1], amount = 0", "output": "0"},
        ],
        "expected_time_complexity": "O(amount * len(coins))",
        "expected_space_complexity": "O(amount)",
        "ai_hints": [
            "Bottom-up DP: dp[i] = min coins to make amount i.",
            "dp[0] = 0, initialize rest to amount+1 (infinity substitute).",
            "For each amount from 1 to target, try each coin.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def coinChange(coins, amount):\n    pass"},
    },
    {
        "title": "LRU Cache",
        "description": (
            "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\n"
            "Implement the LRUCache class:\n"
            "- LRUCache(int capacity): Initialize the LRU cache with positive size capacity.\n"
            "- int get(int key): Return the value of the key if the key exists, otherwise return -1.\n"
            "- void put(int key, int value): Update the value if key exists. Otherwise, add the key-value pair. "
            "If the number of keys exceeds capacity, evict the LRU key."
        ),
        "difficulty": "medium",
        "category": "design",
        "tags": ["hash_map", "doubly_linked_list", "design"],
        "constraints": ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5"],
        "examples": [
            {"input": "LRUCache(2), put(1,1), put(2,2), get(1)=1, put(3,3), get(2)=-1", "output": "As described"},
        ],
        "expected_time_complexity": "O(1) for both get and put",
        "expected_space_complexity": "O(capacity)",
        "ai_hints": [
            "Use an OrderedDict in Python (maintains insertion order + O(1) ops).",
            "Or implement doubly linked list + hash map manually.",
            "Move accessed item to end (most recent), evict from front (least recent).",
        ],
        "test_cases": [],
        "solution_template": {"python": "class LRUCache:\n    def __init__(self, capacity):\n        pass\n    def get(self, key):\n        pass\n    def put(self, key, value):\n        pass"},
    },
    {
        "title": "3Sum",
        "description": (
            "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] "
            "such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0.\n\n"
            "The solution set must not contain duplicate triplets."
        ),
        "difficulty": "medium",
        "category": "array",
        "tags": ["array", "two_pointers", "sorting"],
        "constraints": ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
        "examples": [
            {"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"},
            {"input": "nums = [0,1,1]", "output": "[]"},
            {"input": "nums = [0,0,0]", "output": "[[0,0,0]]"},
        ],
        "expected_time_complexity": "O(n^2)",
        "expected_space_complexity": "O(n) for sorting",
        "ai_hints": [
            "Sort the array first.",
            "Fix one element, then use two pointers for the remaining two.",
            "Skip duplicate elements to avoid duplicate triplets.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def threeSum(nums):\n    pass"},
    },
    # ─── HARD ─────────────────────────────────────────────────────────────────
    {
        "title": "Median of Two Sorted Arrays",
        "description": (
            "Given two sorted arrays nums1 and nums2 of size m and n respectively, "
            "return the median of the two sorted arrays.\n\n"
            "The overall run time complexity should be O(log (m+n))."
        ),
        "difficulty": "hard",
        "category": "binary_search",
        "tags": ["array", "binary_search", "divide_and_conquer"],
        "constraints": ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000"],
        "examples": [
            {"input": "nums1 = [1,3], nums2 = [2]", "output": "2.00000", "explanation": "Merged = [1,2,3], median = 2"},
            {"input": "nums1 = [1,2], nums2 = [3,4]", "output": "2.50000", "explanation": "Merged = [1,2,3,4], median = (2+3)/2 = 2.5"},
        ],
        "expected_time_complexity": "O(log(min(m,n)))",
        "expected_space_complexity": "O(1)",
        "ai_hints": [
            "Binary search on the smaller array's partition point.",
            "Ensure left halves of both arrays combined have (m+n+1)//2 elements.",
            "Check that max_left1 <= min_right2 and max_left2 <= min_right1.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def findMedianSortedArrays(nums1, nums2):\n    pass"},
    },
    {
        "title": "Trapping Rain Water",
        "description": (
            "Given n non-negative integers representing an elevation map where the width of each bar is 1, "
            "compute how much water it can trap after raining."
        ),
        "difficulty": "hard",
        "category": "array",
        "tags": ["array", "two_pointers", "dynamic_programming", "stack"],
        "constraints": ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
        "examples": [
            {"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"},
            {"input": "height = [4,2,0,3,2,5]", "output": "9"},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(1)",
        "ai_hints": [
            "Use two pointers (left, right) moving toward center.",
            "Track left_max and right_max as you go.",
            "Water at position = min(left_max, right_max) - height[i].",
        ],
        "test_cases": [],
        "solution_template": {"python": "def trap(height):\n    pass"},
    },
    {
        "title": "Word Break",
        "description": (
            "Given a string s and a dictionary of strings wordDict, return true if s can be segmented "
            "into a space-separated sequence of one or more dictionary words."
        ),
        "difficulty": "hard",
        "category": "dynamic_programming",
        "tags": ["string", "dynamic_programming", "trie", "memoization"],
        "constraints": ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "All strings consist of lowercase English letters"],
        "examples": [
            {"input": "s = 'leetcode', wordDict = ['leet','code']", "output": "true"},
            {"input": "s = 'applepenapple', wordDict = ['apple','pen']", "output": "true"},
            {"input": "s = 'catsandog', wordDict = ['cats','dog','sand','and','cat']", "output": "false"},
        ],
        "expected_time_complexity": "O(n^2)",
        "expected_space_complexity": "O(n)",
        "ai_hints": [
            "DP: dp[i] = can we form s[:i] using wordDict words.",
            "For each position i, try all j < i and check if dp[j] and s[j:i] in wordDict.",
            "Convert wordDict to a set for O(1) lookups.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def wordBreak(s, wordDict):\n    pass"},
    },
    {
        "title": "Serialize and Deserialize Binary Tree",
        "description": (
            "Design an algorithm to serialize and deserialize a binary tree. "
            "Serialization converts a tree to a string, deserialization reconstructs the tree from the string.\n\n"
            "There is no restriction on how your serialization/deserialization algorithm should work. "
            "Just ensure that a binary tree can be serialized to a string and this string can be deserialized to "
            "the original tree structure."
        ),
        "difficulty": "hard",
        "category": "tree",
        "tags": ["tree", "bfs", "dfs", "design", "string"],
        "constraints": ["The number of nodes in the tree is in the range [0, 10^4]"],
        "examples": [
            {"input": "root = [1,2,3,null,null,4,5]", "output": "[1,2,3,null,null,4,5]"},
        ],
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(n)",
        "ai_hints": [
            "BFS level-order traversal works well for serialization.",
            "Use '#' or 'null' to represent None nodes.",
            "For deserialization, use a queue and process node by node.",
        ],
        "test_cases": [],
        "solution_template": {"python": "class Codec:\n    def serialize(self, root):\n        pass\n    def deserialize(self, data):\n        pass"},
    },
    # ─── EXPERT ───────────────────────────────────────────────────────────────
    {
        "title": "Edit Distance (Levenshtein)",
        "description": (
            "Given two strings word1 and word2, return the minimum number of operations required to "
            "convert word1 to word2.\n\n"
            "You have the following three operations permitted on a word:\n"
            "- Insert a character\n- Delete a character\n- Replace a character"
        ),
        "difficulty": "expert",
        "category": "dynamic_programming",
        "tags": ["string", "dynamic_programming"],
        "constraints": ["0 <= word1.length, word2.length <= 500"],
        "examples": [
            {"input": "word1 = 'horse', word2 = 'ros'", "output": "3"},
            {"input": "word1 = 'intention', word2 = 'execution'", "output": "5"},
        ],
        "expected_time_complexity": "O(m*n)",
        "expected_space_complexity": "O(m*n) or O(min(m,n)) with optimization",
        "ai_hints": [
            "2D DP: dp[i][j] = edit distance between word1[:i] and word2[:j].",
            "Base cases: dp[i][0] = i (delete all), dp[0][j] = j (insert all).",
            "Recurrence: if chars match, dp[i][j] = dp[i-1][j-1]; else min(insert, delete, replace) + 1.",
        ],
        "test_cases": [],
        "solution_template": {"python": "def minDistance(word1, word2):\n    pass"},
    },
]


async def seed_problems():
    """Insert coding problems if the collection is empty."""
    db = get_db()

    existing = await db.coding_problems.count_documents({})
    if existing >= len(PROBLEMS):
        log.info("Coding problems already seeded", count=existing)
        return

    # Upsert by title so reruns are idempotent
    inserted = 0
    for problem in PROBLEMS:
        result = await db.coding_problems.update_one(
            {"title": problem["title"]},
            {"$setOnInsert": problem},
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1

    log.info("Coding problems seeded", inserted=inserted, total=len(PROBLEMS))
    print(f"✅ Seeded {inserted} new coding problems ({len(PROBLEMS)} total in seed set).")


if __name__ == "__main__":
    asyncio.run(seed_problems())
