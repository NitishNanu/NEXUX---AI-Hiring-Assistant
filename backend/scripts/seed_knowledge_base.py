"""
Seed script: ingest curated HR/interview knowledge base into the FAISS vector store.

This gives the RAG chatbot real content to retrieve from — without it, the
chatbot can only rely on the LLM's parametric knowledge with no retrieval context.

Run from project root:
    python -m backend.scripts.seed_knowledge_base

Requires MONGODB_URL and at least one LLM API key set in .env.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.logger import get_logger

log = get_logger(__name__)

# Each document = a chunk of expert HR/interview knowledge
KNOWLEDGE_DOCUMENTS = [
    {
        "title": "STAR Method for Behavioral Interviews",
        "content": """
The STAR method is the gold standard for answering behavioral interview questions.

STAR stands for:
- Situation: Set the scene. Describe the context and background.
- Task: Explain the challenge or responsibility you faced.
- Action: Describe the specific steps YOU took (use "I", not "we").
- Result: Share the outcome with quantified impact whenever possible.

Example: "Tell me about a time you led a project under tight deadlines."
- Situation: "In Q3 2023, our team was asked to deliver an API integration 2 weeks ahead of schedule after a client escalation."
- Task: "As the senior engineer, I had to re-plan the sprint and re-allocate tasks."
- Action: "I broke the feature into 4 parallel workstreams, paired junior devs with seniors, and daily standups became 30-minute blockers-only sessions."
- Result: "We shipped 3 days ahead of the new deadline with zero production issues, and the client renewed their contract for 2 more years."

Common behavioral questions using STAR:
1. Tell me about a time you handled a conflict.
2. Describe a situation where you failed and what you learned.
3. Give an example of a time you showed leadership.
4. Tell me about a time you dealt with ambiguity.
5. Describe how you handled a difficult stakeholder.

Pro tips:
- Keep stories to 2-3 minutes max.
- Always quantify results (%, $, time saved, users impacted).
- Pick stories that show growth and self-awareness.
- Prepare 5-7 STAR stories before any interview.
""",
    },
    {
        "title": "Resume Writing Best Practices",
        "content": """
A strong resume passes ATS filters AND impresses human readers. Here are the key rules:

1. LENGTH: 1 page for <5 years experience; 2 pages for senior roles. Never exceed 2 pages.

2. FORMAT:
   - Use a clean, single-column format for ATS compatibility.
   - Avoid tables, images, headers/footers, and text boxes — ATS parsers cannot read them.
   - Stick to standard section headers: "Experience", "Education", "Skills", "Projects".

3. BULLET POINTS: Every experience bullet should follow XYZ format:
   "Accomplished [X] as measured by [Y], by doing [Z]."
   Example: "Reduced API response time by 40% (200ms to 120ms) by implementing Redis caching."

4. ACTION VERBS: Start every bullet with a strong verb:
   Built, Designed, Led, Reduced, Improved, Developed, Implemented, Automated, Optimized, Launched, Scaled, Mentored.

5. QUANTIFY EVERYTHING: Numbers tell a story.
   - How much? (40% faster, $2M revenue)
   - How many? (10 engineers, 50 microservices)
   - How often? (daily, weekly, 100k requests/day)

6. KEYWORDS: Mirror the language in the job description exactly.
   If the JD says "RESTful APIs", don't write "REST Services".

7. SKILLS SECTION: List specific technologies, not soft skills.
   Good: "Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes"
   Bad: "Good communicator, team player, fast learner"

8. PROJECTS: Include 2-3 strong technical projects with GitHub links.
   Each project should mention: tech stack, your role, and measurable outcome.

9. ATS OPTIMIZATION:
   - Use standard file format (PDF with selectable text, or DOCX).
   - Never use logos or icons.
   - Include role title verbatim from the JD as your target title.
""",
    },
    {
        "title": "Technical Interview Preparation Guide",
        "content": """
Technical interviews at top companies typically cover these areas:

1. DATA STRUCTURES AND ALGORITHMS (DSA):
   - Arrays, Strings, Linked Lists, Trees, Graphs, Heaps, Hash Maps, Stacks, Queues, Tries
   - Sorting: QuickSort, MergeSort, HeapSort, Counting Sort
   - Search: Binary Search, BFS, DFS, Dijkstra's, A*
   - DP: Memoization, tabulation, common patterns (knapsack, LCS, LIS, coin change)
   - Key patterns: Two Pointers, Sliding Window, Fast/Slow Pointers, Merge Intervals, Cyclic Sort

2. SYSTEM DESIGN (Senior roles):
   - URL Shortener, Twitter Feed, WhatsApp, YouTube, Uber, Airbnb, Netflix
   - Components: Load Balancers, CDN, Caches (Redis, Memcached), Queues (Kafka), DBs (SQL, NoSQL)
   - Concepts: CAP theorem, eventual vs strong consistency, sharding, replication, rate limiting
   - Framework: Requirements → Capacity Estimation → API Design → Data Model → Architecture

3. OBJECT-ORIENTED DESIGN (Mid/Senior):
   - Design patterns: Singleton, Factory, Observer, Strategy, Decorator
   - SOLID principles
   - UML diagrams

4. CODING BEST PRACTICES:
   - Write clean, readable code with meaningful variable names
   - Handle edge cases: empty input, null, overflow, negative numbers
   - Analyze time AND space complexity for every solution
   - Think out loud — interviewers want to see your thought process

5. HOW TO APPROACH A CODING PROBLEM:
   Step 1: Clarify requirements (5 min)
   Step 2: Discuss approach BEFORE coding (5 min)
   Step 3: Code the solution (15-20 min)
   Step 4: Test with examples (5 min)
   Step 5: Optimize if time permits (5 min)

6. RECOMMENDED PRACTICE:
   - LeetCode: 75 curated (Blind 75) + company-specific
   - System Design: Grokking the System Design Interview, Alex Xu's "System Design Interview"
   - Mock interviews: Pramp, interviewing.io
""",
    },
    {
        "title": "Salary Negotiation Guide for Engineers",
        "content": """
Negotiating your salary is expected. Not negotiating costs engineers an average of $5,000-$20,000/year.

FRAMEWORK:

1. KNOW YOUR MARKET RATE:
   - Sources: Glassdoor, Levels.fyi (for tech), LinkedIn Salary, Payscale, Blind
   - Consider: total compensation = base + equity (RSUs/options) + bonus + benefits
   - For FAANG/Big Tech: equity can be 30-50% of total compensation

2. TIMING:
   - Never give a number first. "What is your budget for this role?" 
   - If forced, give a range where your target is the bottom of the range.
   - Only negotiate AFTER receiving an offer.

3. HOW TO NEGOTIATE:
   Step 1: Express enthusiasm for the offer.
   Step 2: Ask for time (24-48 hours) to review.
   Step 3: Research and prepare counter.
   Step 4: Counter with specific data.
   
   Script: "I'm really excited about this opportunity. Based on my research on Levels.fyi 
   and similar roles in [city], the market rate for someone with my [X years] of experience 
   in [tech stack] is around $[Y]. Could we get closer to $[target]?"

4. NEGOTIATING BEYOND BASE SALARY:
   - Sign-on bonus (one-time, compensates for unvested equity at current job)
   - Equity cliff (ask for shorter cliff: 6 months vs 1 year)
   - Start date flexibility
   - Remote/hybrid work
   - Title (Senior vs Staff can mean $20-50k+ difference)
   - Professional development budget

5. EXPERIENCE-BASED SALARY RANGES (US, 2024):
   - Entry Level (0-2 years): $80k-$130k base
   - Mid Level (2-5 years): $120k-$180k base
   - Senior (5-10 years): $160k-$250k base
   - Staff/Principal (10+ years): $220k-$400k+ base
   - FAANG adds 50-100% in equity on top

6. INDIA MARKET (2024):
   - Entry Level (0-2 years): ₹4-12 LPA
   - Mid Level (2-5 years): ₹12-30 LPA
   - Senior (5-8 years): ₹25-60 LPA
   - Staff/Architect (8+ years): ₹50-120+ LPA
   - Product companies pay 2-3x service companies
""",
    },
    {
        "title": "System Design Interview Framework",
        "content": """
A structured approach to any system design interview:

STEP 1: CLARIFY REQUIREMENTS (5-10 minutes)
- Functional: What features must the system have?
  "Should users be able to edit posts? Are likes public or private?"
- Non-functional: What are the quality attributes?
  "How many users? Read-heavy or write-heavy? Consistency requirements? Latency SLA?"
- Scale: "Design for 10M users" or "100K requests/second"

STEP 2: CAPACITY ESTIMATION
- Daily Active Users (DAU) → Requests Per Second (RPS)
- Storage: data per entity × entities × retention period
- Bandwidth: average request/response size × RPS
- Example: 100M DAU, 5 requests/day avg = 100M×5/86400 ≈ 5800 RPS peak ~= 10K RPS

STEP 3: API DESIGN
- Define the key API endpoints the system needs
- Example for Twitter: POST /tweets, GET /feed, POST /follow

STEP 4: DATA MODELING
- Identify core entities and their relationships
- Choose SQL vs NoSQL based on query patterns
- Example: Users table, Tweets table, Followers table

STEP 5: HIGH-LEVEL ARCHITECTURE
- Client → Load Balancer → API Servers → Cache → Database
- Add: CDN for static assets, Queue for async processing, Search service

STEP 6: DEEP DIVE INTO KEY COMPONENTS
- Pick 2-3 components and go deep based on interviewer cues
- Common deep dives: Database sharding, Caching strategy, Feed generation algorithm

STEP 7: IDENTIFY TRADE-OFFS AND BOTTLENECKS
- Where could this fail? Single points of failure?
- Read-write latency trade-offs?
- Cost vs performance trade-offs?

COMMON SYSTEM DESIGN COMPONENTS:
- Load Balancer: Round-robin, least connections, consistent hashing
- Cache: Redis (in-memory KV store), cache-aside vs write-through vs write-behind
- Database: Read replicas for read scaling, sharding for write scaling
- Queue: Kafka (high throughput, persistent), RabbitMQ (complex routing), SQS (managed)
- Search: Elasticsearch for full-text search
- CDN: CloudFront, Cloudflare for static assets
""",
    },
    {
        "title": "Common Interview Mistakes and How to Avoid Them",
        "content": """
TOP MISTAKES ENGINEERS MAKE IN INTERVIEWS:

1. JUMPING INTO CODE WITHOUT CLARIFYING:
   ❌ Wrong: "OK I'll code a function that returns the two indices."
   ✅ Right: "Before I code, can I confirm: can there be multiple valid answers? 
              Should I handle negative numbers? What's the expected output format?"

2. STAYING SILENT:
   ❌ Wrong: Silent coding for 15 minutes.
   ✅ Right: Continuously narrate your thought process. "I'm thinking of using a hash map 
              here because it gives O(1) lookups, which would bring the overall complexity 
              to O(n) vs O(n^2) with nested loops."

3. IGNORING EDGE CASES:
   ❌ Wrong: Coding the happy path only.
   ✅ Right: Always check empty input, null values, single element, all same values, 
              very large inputs (overflow?).

4. NOT ANALYZING COMPLEXITY:
   ❌ Wrong: Never mentioning Big-O.
   ✅ Right: After every solution, state time and space complexity proactively.

5. GIVING UP WHEN STUCK:
   ❌ Wrong: "I don't know how to solve this."
   ✅ Right: "Let me start with a brute force O(n^2) approach and then optimize."
              Always have a working solution, then improve.

6. OVER-ENGINEERING:
   ❌ Wrong: "I'll add a Redis cache, a message queue, and a microservice for this..."
   ✅ Right: Start simple. Add complexity only when explicitly asked to scale.

7. IGNORING INTERVIEWER HINTS:
   ❌ Wrong: Plowing ahead after the interviewer says "is there a more efficient way?"
   ✅ Right: Stop immediately. "That's a good point — I think I can improve this with..."

8. POOR VARIABLE NAMING:
   ❌ Wrong: def f(x, y, z): a = x + y; return a
   ✅ Right: def sum_and_count(nums, target, count): total = nums + target; return total

9. NOT ASKING ABOUT CONSTRAINTS:
   - Is the data sorted? Can I use extra memory? Is this a streaming problem?

10. FORGETTING TO TEST YOUR OWN CODE:
    - Run through 2-3 examples manually. Trace through your code like a debugger.
    - Test the edge cases you identified earlier.
""",
    },
    {
        "title": "Questions to Ask Your Interviewer",
        "content": """
Asking great questions shows preparation, curiosity, and culture fit.
Always prepare 3-5 questions. Never ask about salary/vacation in a first interview.

QUESTIONS ABOUT THE ROLE:
1. What does a typical day/week look like for this role?
2. What would success look like in the first 30/60/90 days?
3. What are the biggest technical challenges the team is facing right now?
4. How does the team handle on-call and incident response?
5. What does the code review process look like here?

QUESTIONS ABOUT THE TEAM:
1. How is the team structured? How many engineers, PMs, designers?
2. What's the collaboration style — async-first or lots of meetings?
3. How does the team handle disagreements about technical decisions?
4. What does growth look like for engineers here?

QUESTIONS ABOUT ENGINEERING CULTURE:
1. How does the company approach technical debt?
2. What's the deployment frequency? How long does a feature take from idea to production?
3. Do engineers have ownership over their features in production?
4. How does the company invest in engineers' learning and development?

QUESTIONS ABOUT THE COMPANY:
1. What excites you most about working here?
2. Where do you see the company in 3-5 years?
3. What's the most challenging aspect of working here?

QUESTIONS TO AVOID:
- What is the salary? (Wait until offer stage)
- How many vacation days do I get?
- What time do people usually leave the office?
- Can I work from home all the time? (Ask this later, diplomatically)
""",
    },
    {
        "title": "ATS Resume Optimization Guide",
        "content": """
Applicant Tracking Systems (ATS) scan resumes before humans see them.
Up to 75% of resumes are rejected by ATS before reaching a recruiter.

HOW ATS WORKS:
1. Parses your resume into structured data (name, contact, sections, skills)
2. Scores your resume against the job description keywords
3. Ranks candidates; only top % go to human review

TOP ATS KILLERS (avoid these):
- Tables, text boxes, columns (ATS reads linearly, misses table content)
- Headers and footers with contact info (often ignored)
- Images, logos, icons (cannot be parsed)
- Fancy fonts and colors (may corrupt parsing)
- PDF with text as image (not selectable text)
- Abbreviations without expansion (ML vs Machine Learning)

HOW TO OPTIMIZE FOR ATS:
1. KEYWORD MATCHING:
   - Read the JD carefully, identify 10-15 key skills/terms
   - Include them verbatim in your resume (exact spelling, not synonyms)
   - Distribute naturally across skills, experience, and summary sections

2. STANDARD SECTION HEADERS: Use exact: 
   "Work Experience" or "Experience" — NOT "Where I've Been"
   "Education" — NOT "Academic Background"
   "Skills" — NOT "My Toolkit"

3. DATE FORMATS: Use consistent format: "Jan 2022 – Present" or "2022 – Present"

4. CONTACT INFO: Include email, phone, LinkedIn, GitHub in the body (not header/footer)

5. FILE FORMAT: Submit PDF with selectable text OR DOCX. Test: can you highlight text?

6. SPELL CORRECTLY: ATS does exact string matching. "Javascrip" won't match "JavaScript"

7. SPELL OUT ACRONYMS:
   "ML (Machine Learning)", "NLP (Natural Language Processing)"

8. TAILORING: Customize your resume for EACH job application.
   Generic resumes get ~30% lower ATS scores than tailored ones.

WHAT ATS TYPICALLY SCORES:
- Keyword density and relevance (highest weight)
- Required skills present vs missing
- Years of experience match
- Education level match
- Job title similarity
""",
    },
]


def seed_knowledge_base():
    """Ingest curated documents into the FAISS vector store."""
    try:
        from backend.services.rag_pipeline import ingest_texts, load_vector_store

        # Try to load existing index first
        load_vector_store()

        texts = [doc["content"] for doc in KNOWLEDGE_DOCUMENTS]
        metadatas = [{"title": doc["title"], "source": "nexus_kb"} for doc in KNOWLEDGE_DOCUMENTS]

        chunks_added = ingest_texts(texts, metadatas)
        log.info(
            "Knowledge base seeded",
            documents=len(KNOWLEDGE_DOCUMENTS),
            chunks=chunks_added,
        )
        print(f"✅ Seeded {len(KNOWLEDGE_DOCUMENTS)} documents ({chunks_added} chunks) into FAISS.")

    except ImportError as e:
        log.warning("RAG dependencies not installed", error=str(e))
        print(f"⚠️  Could not seed knowledge base: {e}")
        print("   Install: pip install faiss-cpu langchain-community")
    except Exception as e:
        log.error("Knowledge base seeding failed", error=str(e))
        print(f"❌ Failed to seed knowledge base: {e}")


if __name__ == "__main__":
    seed_knowledge_base()
