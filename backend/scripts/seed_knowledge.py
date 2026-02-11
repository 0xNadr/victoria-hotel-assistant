#!/usr/bin/env python3
"""
Seed the ChromaDB knowledge base with Dormero hotel data.
Run from the backend directory: python -m scripts.seed_knowledge
"""

import json
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.knowledge_base import KnowledgeBaseService


def load_hotel_data(hotel_file: str) -> list[dict]:
    """Load hotel data from JSON file."""
    with open(hotel_file, "r") as f:
        data = json.load(f)

    documents = []
    hotel_id = data["hotel_id"]
    hotel_name = data["hotel_name"]

    for doc in data["documents"]:
        documents.append({
            "id": doc["id"],
            "content": doc["content"],
            "metadata": {
                "hotel_id": hotel_id,
                "hotel_name": hotel_name,
                "category": doc["category"],
            },
        })

    return documents


def main():
    print("Initializing knowledge base service...")
    kb = KnowledgeBaseService()

    # Clear existing data
    print("Clearing existing documents...")
    kb.delete_all()

    # Load and add hotel data
    data_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "app",
        "data",
        "hotels",
    )

    total_docs = 0

    for filename in os.listdir(data_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(data_dir, filename)
            print(f"Loading {filename}...")

            documents = load_hotel_data(filepath)
            kb.add_documents(documents)
            total_docs += len(documents)
            print(f"  Added {len(documents)} documents")

    print(f"\nKnowledge base seeded successfully!")
    print(f"Total documents: {total_docs}")

    # Verify with a test query
    print("\nTesting with sample query: 'parking at berlin hotel'")
    results = kb.query("parking at berlin hotel", n_results=2)
    for i, result in enumerate(results):
        print(f"\nResult {i + 1}:")
        print(f"  Category: {result['metadata'].get('category')}")
        print(f"  Score: {result['score']:.3f}")
        print(f"  Content: {result['content'][:100]}...")


if __name__ == "__main__":
    main()
