#!/usr/bin/env python
"""
Demonstration of improved engine sophistication.
Shows how the enhanced Translation, Routing, and Composition engines
handle complex ADHD input patterns.
"""

from app.engines.translation import translate
from app.engines.routing import route
from app.engines.composition import compose

test_cases = [
    {
        "name": "Rambling ADHD input with buried question",
        "input": "okay so like i've been thinking about architecture and also logging is weird, which model should i use",
        "description": "Tests: emotional language normalization, buried question extraction, scope detection"
    },
    {
        "name": "Highly emotional uncertain question",
        "input": "i'm SO confused and stressed about this design pattern thing??? like should i use abstract factories or like... something else?? help!!",
        "description": "Tests: emotional intensity detection, multiple question handling, urgency detection"
    },
    {
        "name": "Vague question with implicit context",
        "input": "ok so we're building this thing and it needs to be fast and handle like thousands of requests but also scale to millions later. What's the best approach?",
        "description": "Tests: assumption extraction, context awareness, complexity scoring"
    },
    {
        "name": "Comparison without explicit question",
        "input": "Python vs Go vs Rust. Which one should we use for our backend? Performance is key, we care about latency.",
        "description": "Tests: decision keyword detection, domain classification (comparative/decision)"
    },
]

print("=" * 80)
print("TRANSLATION ENGINE IMPROVEMENTS")
print("=" * 80)

for i, test in enumerate(test_cases, 1):
    print(f"\n[Test {i}] {test['name']}")
    print(f"Description: {test['description']}")
    print(f"Input: {test['input']}")
    print("-" * 80)

    translation = translate(test['input'])

    print(f"Core translations:")
    for j, trans in enumerate(translation['translations'][:2], 1):
        print(f"  {j}. {trans['translated_text']}")
        print(f"     Confidence: {trans['confidence']}%")

    analysis = translation['analysis']
    print(f"\nAnalysis:")
    print(f"  Emotional content: {analysis['emotional_content']}")
    print(f"  Scope: {analysis['scope']}")
    print(f"  Clarity: {analysis['clarity']}")
    print(f"  Questions detected: {analysis['num_questions']}")
    if analysis['assumptions']:
        print(f"  Assumptions:")
        for assumption in analysis['assumptions']:
            print(f"    - {assumption}")

print("\n" + "=" * 80)
print("ROUTING ENGINE IMPROVEMENTS")
print("=" * 80)

routing_tests = [
    ("What is Python?", "Simple factual"),
    ("Design a distributed system that handles 1M concurrent users with sub-100ms latency",
     "Complex architectural"),
    ("Should I use TypeScript or JavaScript for this project?", "Decision-making"),
    ("Explore what AI could do for climate change", "Exploratory"),
]

for question, description in routing_tests:
    print(f"\n[{description}]")
    print(f"Question: {question}")
    print("-" * 80)

    routing = route([question])
    r = routing['routings'][0]

    print(f"Routed to: {r['routed_model'].upper()}")
    print(f"Confidence: {r['confidence']}%")
    print(f"Reasoning: {r['reasoning']}")
    print(f"Dimensions:")
    for dim, value in r['dimensions'].items():
        print(f"  {dim}: {value}")

print("\n" + "=" * 80)
print("COMPOSITION ENGINE IMPROVEMENTS")
print("=" * 80)

composition_tests = [
    ("Explain quantum entanglement to a beginner", "haiku", "analytical"),
    ("What are the trade-offs between microservices and monolithic architecture?",
     "opus-fast", "analytical"),
    ("Design a novel machine learning architecture for real-time video processing",
     "opus-thinking", "creative"),
]

for question, model, domain in composition_tests:
    print(f"\n[{model.upper()} - {domain.upper()}]")
    print(f"Question: {question}")
    print("-" * 80)

    composition = compose(question, model, domain)

    print(f"Techniques selected ({len(composition['techniques'])}):")
    for tech in composition['techniques']:
        print(f"  - {tech['name']} (confidence: {tech['confidence']}%)")

    print(f"\nComposition confidence: {composition['confidence']}%")
    print(f"Estimated tokens: {composition['estimated_tokens']}")
    print(f"\nFinal prompt preview (first 200 chars):")
    print(f"  {composition['final_prompt'][:200]}...")

print("\n" + "=" * 80)
print("FULL PIPELINE TEST")
print("=" * 80)

adhd_input = "okay so i've been thinking about refactoring our codebase but also we need better logging and monitoring. which model is best for design advice?"
print(f"\nADHD Input: {adhd_input}\n")

# Step 1: Translate
translation = translate(adhd_input)
core_question = translation['translations'][0]['translated_text']
print(f"1. Translation → {core_question}")
print(f"   (Confidence: {translation['translations'][0]['confidence']}%)")

# Step 2: Route
routing = route([core_question])
model = routing['routings'][0]['routed_model']
domain = routing['routings'][0]['dimensions']['domain']
print(f"\n2. Routing → {model.upper()} (Reasoning: {routing['routings'][0]['reasoning']})")

# Step 3: Compose
composition = compose(core_question, model, domain)
techniques = [t['name'] for t in composition['techniques']]
print(f"\n3. Composition → {len(composition['techniques'])} techniques: {', '.join(techniques)}")
print(f"   (Confidence: {composition['confidence']}%)")

print(f"\n4. Ready to send to Claude with optimized prompt!")

print("\n" + "=" * 80)
