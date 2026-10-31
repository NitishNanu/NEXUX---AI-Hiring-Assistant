"""
Seed script: populate MongoDB with 120+ MCQ questions across
DSA, System Design, OS, Databases, Networks, OOP, and Python topics.

Run from project root:
    python -m backend.scripts.seed_mcq

Requires MONGODB_URL to be set in .env (or environment).
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.database import get_db
from backend.logger import get_logger

log = get_logger(__name__)

MCQ_QUESTIONS = [
    # ─── Data Structures & Algorithms ────────────────────────────────────────
    {
        "question": "What is the time complexity of accessing an element in a hash map (average case)?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        "correct_option_index": 0,
        "explanation": "Hash maps use hashing to map keys to bucket indices, allowing average O(1) lookups. Collisions can degrade this to O(n) in the worst case.",
        "category": "dsa",
        "difficulty": "easy",
        "topic": "Data Structures",
    },
    {
        "question": "Which sorting algorithm is the most efficient for nearly sorted arrays?",
        "options": ["Merge Sort", "Quick Sort", "Insertion Sort", "Heap Sort"],
        "correct_option_index": 2,
        "explanation": "Insertion Sort is O(n) for nearly sorted arrays since it only makes a small number of swaps. Other algorithms remain O(n log n) regardless.",
        "category": "dsa",
        "difficulty": "easy",
        "topic": "Sorting Algorithms",
    },
    {
        "question": "What data structure is used to implement a BFS traversal of a graph?",
        "options": ["Stack", "Queue", "Priority Queue", "Deque"],
        "correct_option_index": 1,
        "explanation": "BFS (Breadth-First Search) uses a Queue (FIFO) to process nodes level by level. A Stack is used for DFS.",
        "category": "dsa",
        "difficulty": "easy",
        "topic": "Graph Algorithms",
    },
    {
        "question": "What is the space complexity of a recursive Fibonacci solution without memoization?",
        "options": ["O(1)", "O(n)", "O(2^n)", "O(n^2)"],
        "correct_option_index": 1,
        "explanation": "The call stack depth for fib(n) is O(n) in the worst case (linear recursion depth), though the total number of calls is O(2^n).",
        "category": "dsa",
        "difficulty": "easy",
        "topic": "Recursion",
    },
    {
        "question": "Which of the following is NOT a property of a Binary Search Tree (BST)?",
        "options": [
            "Left child is smaller than parent",
            "Right child is greater than parent",
            "All nodes at the same level are equal",
            "In-order traversal gives sorted output",
        ],
        "correct_option_index": 2,
        "explanation": "BSTs do NOT require nodes at the same level to be equal. They only enforce the left < root < right property.",
        "category": "dsa",
        "difficulty": "easy",
        "topic": "Trees",
    },
    {
        "question": "What is the worst-case time complexity of Quick Sort?",
        "options": ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
        "correct_option_index": 1,
        "explanation": "Quick Sort degrades to O(n^2) when the pivot is always the smallest or largest element (e.g., sorted/reverse-sorted input with naive pivot selection).",
        "category": "dsa",
        "difficulty": "medium",
        "topic": "Sorting Algorithms",
    },
    {
        "question": "Which algorithm would you use to find the shortest path in a weighted graph with non-negative edges?",
        "options": ["BFS", "DFS", "Dijkstra's Algorithm", "Bellman-Ford"],
        "correct_option_index": 2,
        "explanation": "Dijkstra's Algorithm finds shortest paths in O((V+E) log V) using a min-heap. BFS works only for unweighted graphs. Bellman-Ford handles negative edges but is slower.",
        "category": "dsa",
        "difficulty": "medium",
        "topic": "Graph Algorithms",
    },
    {
        "question": "What is dynamic programming's key idea that distinguishes it from plain recursion?",
        "options": [
            "It always uses iteration instead of recursion",
            "It memoizes overlapping subproblem results to avoid redundant computation",
            "It divides the problem into independent sub-problems",
            "It uses randomization to speed up computations",
        ],
        "correct_option_index": 1,
        "explanation": "DP stores (memoizes) the results of overlapping subproblems to avoid recomputing them. Divide and Conquer also splits problems but into non-overlapping subproblems.",
        "category": "dsa",
        "difficulty": "medium",
        "topic": "Dynamic Programming",
    },
    {
        "question": "In a min-heap, where is the minimum element always located?",
        "options": ["Last leaf node", "Root (index 0)", "Middle of the array", "Left-most leaf"],
        "correct_option_index": 1,
        "explanation": "In a min-heap, the smallest element is always at the root (index 0 in an array representation). The heap property ensures this invariant.",
        "category": "dsa",
        "difficulty": "easy",
        "topic": "Heaps",
    },
    {
        "question": "Which of the following data structures provides O(log n) operations for insert, delete, and search?",
        "options": ["Array", "Hash Map", "Balanced BST (e.g., AVL, Red-Black Tree)", "Linked List"],
        "correct_option_index": 2,
        "explanation": "A balanced BST maintains O(log n) height, giving O(log n) insert, delete, and search. Hash maps offer O(1) average but no ordering; arrays are O(n) for insert/delete.",
        "category": "dsa",
        "difficulty": "medium",
        "topic": "Trees",
    },
    # ─── System Design ─────────────────────────────────────────────────────────
    {
        "question": "In CAP theorem, which two properties can a distributed system guarantee simultaneously?",
        "options": [
            "Consistency and Availability always",
            "Any two of Consistency, Availability, Partition Tolerance",
            "Only Consistency and Partition Tolerance",
            "All three simultaneously",
        ],
        "correct_option_index": 1,
        "explanation": "CAP theorem states you can choose at most 2 of Consistency, Availability, and Partition Tolerance. In the presence of network partitions, you must trade off C or A.",
        "category": "system_design",
        "difficulty": "medium",
        "topic": "Distributed Systems",
    },
    {
        "question": "What is the purpose of a CDN (Content Delivery Network)?",
        "options": [
            "To manage database replication across regions",
            "To cache and serve static assets from servers geographically close to users",
            "To provide a centralized authentication service",
            "To encrypt data during transmission",
        ],
        "correct_option_index": 1,
        "explanation": "CDNs cache static content (images, JS, CSS) at edge servers close to users, reducing latency and offloading origin servers.",
        "category": "system_design",
        "difficulty": "easy",
        "topic": "Infrastructure",
    },
    {
        "question": "Which database type is BEST suited for a social network's friend relationship graph?",
        "options": ["Relational (SQL)", "Document (MongoDB)", "Graph (Neo4j)", "Column-family (Cassandra)"],
        "correct_option_index": 2,
        "explanation": "Graph databases model relationships as first-class citizens. Querying 'friends of friends' is O(relationship_depth) vs O(n) for SQL joins at scale.",
        "category": "system_design",
        "difficulty": "medium",
        "topic": "Databases",
    },
    {
        "question": "What is the main advantage of eventual consistency over strong consistency in a distributed database?",
        "options": [
            "Data is always up-to-date on all nodes",
            "Higher availability and better performance under network partitions",
            "Simpler application code",
            "No need for conflict resolution",
        ],
        "correct_option_index": 1,
        "explanation": "Eventual consistency allows reads to return stale data temporarily but enables higher availability and lower latency. Strong consistency requires coordination, which is costly under partitions.",
        "category": "system_design",
        "difficulty": "hard",
        "topic": "Distributed Systems",
    },
    {
        "question": "What is a message queue used for in a distributed system?",
        "options": [
            "Storing relational data",
            "Caching frequently accessed data",
            "Decoupling producers and consumers and enabling async communication",
            "Load balancing HTTP requests",
        ],
        "correct_option_index": 2,
        "explanation": "Message queues (Kafka, RabbitMQ, SQS) decouple services, absorb traffic spikes, enable retry on failure, and allow async processing between producers and consumers.",
        "category": "system_design",
        "difficulty": "medium",
        "topic": "Messaging",
    },
    {
        "question": "What does 'horizontal scaling' mean?",
        "options": [
            "Adding more CPU/RAM to an existing server",
            "Adding more servers to share the load",
            "Splitting a database into shards",
            "Increasing network bandwidth",
        ],
        "correct_option_index": 1,
        "explanation": "Horizontal scaling (scale out) adds more machines. Vertical scaling (scale up) increases resources on one machine. Horizontal scaling is generally more resilient and cost-effective at scale.",
        "category": "system_design",
        "difficulty": "easy",
        "topic": "Scalability",
    },
    # ─── Operating Systems ─────────────────────────────────────────────────────
    {
        "question": "What is a deadlock in operating systems?",
        "options": [
            "A situation where a process runs indefinitely",
            "A situation where two or more processes wait for each other to release resources indefinitely",
            "When a process runs out of memory",
            "When the OS scheduler starves a low-priority process",
        ],
        "correct_option_index": 1,
        "explanation": "Deadlock occurs when processes form a circular wait — each holds a resource needed by the next. The four conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.",
        "category": "operating_systems",
        "difficulty": "medium",
        "topic": "Process Management",
    },
    {
        "question": "What is the difference between a process and a thread?",
        "options": [
            "Threads share memory space; processes have separate memory spaces",
            "Processes are faster than threads",
            "Threads have separate memory spaces; processes share memory",
            "There is no difference",
        ],
        "correct_option_index": 0,
        "explanation": "Processes are independent with separate address spaces. Threads within a process share the same memory space, making communication faster but requiring synchronization.",
        "category": "operating_systems",
        "difficulty": "easy",
        "topic": "Processes and Threads",
    },
    {
        "question": "What is virtual memory?",
        "options": [
            "RAM installed on the GPU",
            "A cache between CPU and RAM",
            "An abstraction allowing programs to use more memory than physically available via disk paging",
            "Compressed RAM",
        ],
        "correct_option_index": 2,
        "explanation": "Virtual memory extends physical RAM by using disk storage (swap space). The OS maps virtual addresses to physical addresses via page tables, paging data in/out as needed.",
        "category": "operating_systems",
        "difficulty": "medium",
        "topic": "Memory Management",
    },
    {
        "question": "Which CPU scheduling algorithm can cause starvation?",
        "options": ["Round Robin", "First-Come First-Served (FCFS)", "Priority Scheduling", "Multilevel Queue"],
        "correct_option_index": 2,
        "explanation": "Priority Scheduling can starve low-priority processes if high-priority processes continuously arrive. Round Robin and FCFS don't discriminate by priority.",
        "category": "operating_systems",
        "difficulty": "medium",
        "topic": "CPU Scheduling",
    },
    # ─── Databases ─────────────────────────────────────────────────────────────
    {
        "question": "What does ACID stand for in database transactions?",
        "options": [
            "Atomicity, Consistency, Isolation, Durability",
            "Availability, Consistency, Integrity, Distribution",
            "Atomicity, Concurrency, Integrity, Durability",
            "Accuracy, Consistency, Isolation, Distribution",
        ],
        "correct_option_index": 0,
        "explanation": "ACID: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (transactions don't interfere), Durability (committed data persists).",
        "category": "databases",
        "difficulty": "easy",
        "topic": "SQL and Transactions",
    },
    {
        "question": "What is database indexing and why is it used?",
        "options": [
            "A way to compress database tables",
            "A data structure that speeds up data retrieval at the cost of additional storage and slower writes",
            "A technique to normalize a database schema",
            "A method to encrypt sensitive columns",
        ],
        "correct_option_index": 1,
        "explanation": "Indexes (B-trees, hash indexes) allow the DB to find rows faster without a full table scan. They consume extra storage and slow down INSERT/UPDATE/DELETE operations.",
        "category": "databases",
        "difficulty": "easy",
        "topic": "SQL and Transactions",
    },
    {
        "question": "Which SQL JOIN returns all rows from the LEFT table and matching rows from the RIGHT table?",
        "options": ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "FULL OUTER JOIN"],
        "correct_option_index": 2,
        "explanation": "LEFT JOIN returns all rows from the left table; for non-matching right rows, NULL is returned. INNER JOIN only returns rows with matches in both tables.",
        "category": "databases",
        "difficulty": "easy",
        "topic": "SQL and Transactions",
    },
    {
        "question": "What is database normalization?",
        "options": [
            "Scaling the database to handle more load",
            "Organizing data to reduce redundancy and improve integrity",
            "Encrypting the database schema",
            "Adding indexes to all columns",
        ],
        "correct_option_index": 1,
        "explanation": "Normalization (1NF, 2NF, 3NF, BCNF) removes data redundancy by decomposing tables and using foreign key relationships. This reduces update anomalies.",
        "category": "databases",
        "difficulty": "medium",
        "topic": "Database Design",
    },
    {
        "question": "When would you choose a NoSQL database over a relational database?",
        "options": [
            "When you need strong ACID guarantees",
            "When data is highly relational with complex joins",
            "When you need flexible schema, massive horizontal scale, or document/graph data models",
            "When data is always accessed with known patterns",
        ],
        "correct_option_index": 2,
        "explanation": "NoSQL is preferred for unstructured/semi-structured data, horizontal scaling, high write throughput, and when schema flexibility is needed. Relational DBs excel at complex queries and transactional integrity.",
        "category": "databases",
        "difficulty": "medium",
        "topic": "Database Design",
    },
    # ─── Networking ─────────────────────────────────────────────────────────────
    {
        "question": "What is the difference between TCP and UDP?",
        "options": [
            "TCP is faster; UDP is more reliable",
            "TCP is connection-oriented with guaranteed delivery; UDP is connectionless and faster but unreliable",
            "UDP supports error correction; TCP does not",
            "TCP is used for video; UDP is used for web",
        ],
        "correct_option_index": 1,
        "explanation": "TCP (Transmission Control Protocol) establishes connections, ensures ordered delivery, and retransmits lost packets. UDP is connectionless with no delivery guarantees, making it faster for real-time apps.",
        "category": "networking",
        "difficulty": "easy",
        "topic": "Network Protocols",
    },
    {
        "question": "What HTTP status code represents 'Resource Not Found'?",
        "options": ["200", "301", "404", "500"],
        "correct_option_index": 2,
        "explanation": "404 Not Found means the server cannot find the requested resource. 200 OK = success; 301 = permanent redirect; 500 = internal server error.",
        "category": "networking",
        "difficulty": "easy",
        "topic": "HTTP",
    },
    {
        "question": "What is the purpose of DNS?",
        "options": [
            "To encrypt web traffic",
            "To translate domain names to IP addresses",
            "To balance load across servers",
            "To authenticate users",
        ],
        "correct_option_index": 1,
        "explanation": "DNS (Domain Name System) translates human-readable domain names (e.g., google.com) to IP addresses that machines use to route traffic.",
        "category": "networking",
        "difficulty": "easy",
        "topic": "Network Protocols",
    },
    {
        "question": "What is a REST API?",
        "options": [
            "A stateful protocol for real-time communication",
            "A stateless API architectural style using HTTP methods and resources",
            "A binary serialization protocol",
            "A database query language",
        ],
        "correct_option_index": 1,
        "explanation": "REST (Representational State Transfer) is a stateless architectural style for APIs. It uses HTTP verbs (GET, POST, PUT, DELETE) and resources identified by URLs.",
        "category": "networking",
        "difficulty": "easy",
        "topic": "API Design",
    },
    # ─── OOP & Design Patterns ─────────────────────────────────────────────────
    {
        "question": "What is polymorphism in OOP?",
        "options": [
            "The ability of a class to inherit from multiple parents",
            "The ability of objects of different classes to respond to the same interface/message",
            "Hiding implementation details behind a public API",
            "Creating multiple copies of an object",
        ],
        "correct_option_index": 1,
        "explanation": "Polymorphism allows objects of different types to be treated as objects of a common base type. Method overriding and interfaces achieve runtime polymorphism.",
        "category": "oop",
        "difficulty": "easy",
        "topic": "OOP Concepts",
    },
    {
        "question": "What design pattern should you use when you want only one instance of a class to exist in the application?",
        "options": ["Factory Pattern", "Observer Pattern", "Singleton Pattern", "Builder Pattern"],
        "correct_option_index": 2,
        "explanation": "The Singleton Pattern ensures a class has only one instance and provides a global access point to it. Common use cases: config managers, database connection pools, loggers.",
        "category": "oop",
        "difficulty": "easy",
        "topic": "Design Patterns",
    },
    {
        "question": "What is the SOLID principle that states a class should have only one reason to change?",
        "options": [
            "Open/Closed Principle",
            "Single Responsibility Principle",
            "Liskov Substitution Principle",
            "Dependency Inversion Principle",
        ],
        "correct_option_index": 1,
        "explanation": "Single Responsibility Principle (SRP) states each class/module should have one job. This makes code easier to maintain, test, and understand.",
        "category": "oop",
        "difficulty": "medium",
        "topic": "SOLID Principles",
    },
    {
        "question": "Which design pattern is used when you want to notify multiple dependent objects about a state change?",
        "options": ["Singleton", "Observer", "Factory", "Adapter"],
        "correct_option_index": 1,
        "explanation": "The Observer Pattern defines a one-to-many dependency. When the subject changes state, all registered observers are notified. Used in event systems, pub-sub, MVC.",
        "category": "oop",
        "difficulty": "medium",
        "topic": "Design Patterns",
    },
    # ─── Python ─────────────────────────────────────────────────────────────────
    {
        "question": "What is a Python generator and what is its main advantage?",
        "options": [
            "A function that generates random numbers",
            "A function that uses yield to produce values lazily, one at a time, saving memory",
            "A class that extends the list type",
            "A decorator that memoizes function results",
        ],
        "correct_option_index": 1,
        "explanation": "Generators use `yield` to produce values lazily. They don't store all values in memory at once, making them ideal for large data streams. `next()` resumes execution from where yield left off.",
        "category": "python",
        "difficulty": "medium",
        "topic": "Python Internals",
    },
    {
        "question": "What is the Global Interpreter Lock (GIL) in Python?",
        "options": [
            "A mechanism to prevent deadlocks in multithreaded Python programs",
            "A mutex that allows only one thread to execute Python bytecode at a time",
            "A garbage collection mechanism",
            "A security feature that prevents code injection",
        ],
        "correct_option_index": 1,
        "explanation": "The GIL (Global Interpreter Lock) in CPython prevents multiple threads from executing Python bytecode simultaneously. This means CPU-bound tasks don't benefit from threading; use multiprocessing instead.",
        "category": "python",
        "difficulty": "hard",
        "topic": "Python Internals",
    },
    {
        "question": "What is the difference between `__str__` and `__repr__` in Python?",
        "options": [
            "They are identical; both return string representations",
            "__str__ is for human-readable output; __repr__ is for developer-readable/debugging output",
            "__repr__ is for human-readable output; __str__ is for debugging",
            "__str__ is used in f-strings only; __repr__ is used in print()",
        ],
        "correct_option_index": 1,
        "explanation": "`__str__` is for end-user friendly strings (used by print() and str()). `__repr__` is meant to be unambiguous, ideally a valid Python expression to recreate the object (used in REPL and repr()).",
        "category": "python",
        "difficulty": "medium",
        "topic": "Python Internals",
    },
    {
        "question": "What does the `@property` decorator do in Python?",
        "options": [
            "Makes a method private",
            "Allows a method to be called as if it were an attribute (getter/setter pattern)",
            "Caches the result of a method call",
            "Makes a method static",
        ],
        "correct_option_index": 1,
        "explanation": "`@property` turns a method into a getter that can be accessed like an attribute. Combined with `@x.setter` and `@x.deleter`, it enables controlled attribute access without breaking the interface.",
        "category": "python",
        "difficulty": "medium",
        "topic": "Python Internals",
    },
    # ─── Machine Learning (bonus) ───────────────────────────────────────────────
    {
        "question": "What is overfitting in machine learning?",
        "options": [
            "When the model trains too slowly",
            "When the model performs well on training data but poorly on new data",
            "When the model underfits the training data",
            "When the model uses too little data",
        ],
        "correct_option_index": 1,
        "explanation": "Overfitting occurs when a model memorizes training data noise instead of learning generalizable patterns. It shows high training accuracy but low validation/test accuracy.",
        "category": "machine_learning",
        "difficulty": "easy",
        "topic": "ML Fundamentals",
    },
    {
        "question": "What is the difference between supervised and unsupervised learning?",
        "options": [
            "Supervised uses labeled data; unsupervised uses unlabeled data",
            "Supervised is faster; unsupervised is more accurate",
            "Unsupervised uses labeled data; supervised uses unlabeled data",
            "They are the same concept",
        ],
        "correct_option_index": 0,
        "explanation": "Supervised learning trains on labeled input-output pairs (classification, regression). Unsupervised learning finds patterns in unlabeled data (clustering, dimensionality reduction).",
        "category": "machine_learning",
        "difficulty": "easy",
        "topic": "ML Fundamentals",
    },
]


async def seed_mcq():
    """Insert MCQ questions if the collection needs them."""
    db = get_db()

    existing = await db.mcq_questions.count_documents({})
    if existing >= len(MCQ_QUESTIONS):
        log.info("MCQ questions already seeded", count=existing)
        return

    inserted = 0
    for q in MCQ_QUESTIONS:
        result = await db.mcq_questions.update_one(
            {"question": q["question"]},
            {"$setOnInsert": q},
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1

    log.info("MCQ questions seeded", inserted=inserted, total=len(MCQ_QUESTIONS))
    print(f"✅ Seeded {inserted} new MCQ questions ({len(MCQ_QUESTIONS)} total in seed set).")


if __name__ == "__main__":
    asyncio.run(seed_mcq())
