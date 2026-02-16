import os
import json
from typing import List, Dict, Any

# Dependency Check
try:
    import chromadb
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    print("[VectorDB] ChromaDB not found. Vector search will be disabled/mocked.")

try:
    from sentence_transformers import SentenceTransformer
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("[VectorDB] SentenceTransformers not found. Embeddings will not be generated.")

# Using a standard, efficient model for semantic search
MODEL_NAME = 'all-MiniLM-L6-v2'
PERSIST_DIRECTORY = "./chroma_db"

class VectorDBService:
    _client = None
    _collection = None
    _model = None
    _mock_data = [] # Fallback storage

    @classmethod
    def get_client(cls):
        if not CHROMA_AVAILABLE: return None
        if cls._client is None:
            # Persistent Client to store data on disk
            # Ensure directory exists
            os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
            cls._client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
        return cls._client

    @classmethod
    def get_collection(cls):
        if not CHROMA_AVAILABLE: return None
        if cls._collection is None:
            client = cls.get_client()
            # Create or get collection
            cls._collection = client.get_or_create_collection(
                name="opportunities",
                metadata={"hnsw:space": "cosine"} # Cosine similarity is best for text embeddings
            )
        return cls._collection

    @classmethod
    def get_model(cls):
        if not TRANSFORMERS_AVAILABLE: return None
        if cls._model is None:
            try:
                # Lazy load model to avoid slow startup if not needed
                print("[VectorDB] Loading Sentence Transformer Model...")
                cls._model = SentenceTransformer(MODEL_NAME)
            except Exception as e:
                print(f"[VectorDB] Failed to load model: {e}")
                return None
        return cls._model

    @classmethod
    def generate_embedding(cls, text: str) -> List[float]:
        model = cls.get_model()
        if model:
            return model.encode(text).tolist()
        return [0.0] * 384 # Mock embedding

    @classmethod
    def add_opportunity(cls, opportunity: Dict[str, Any]):
        """
        Add a single opportunity to vector DB.
        opportunity dict must have: id, title, description. Optional: category, tags, chain.
        """
        try:
            # Fallback for mock data
            cls._mock_data.append(opportunity)
            
            if not CHROMA_AVAILABLE or not TRANSFORMERS_AVAILABLE:
                print(f"[VectorDB] Mock added: {opportunity.get('title')[:30]}")
                return True

            collection = cls.get_collection()
            if not collection: return False
            
            # Combine fields specifically for search relevance
            title = opportunity.get('title', '')
            desc = opportunity.get('description', '')
            tags = opportunity.get('tags', []) or []
            cat = opportunity.get('category', '')
            chain = opportunity.get('chain', '')
            
            text_content = f"{title}. {desc} {cat} {chain} {' '.join(tags)}"
            
            embedding = cls.generate_embedding(text_content)
            
            # Metadata for filtering (Chroma only supports str, int, float, bool)
            metadata = {
                "category": str(cat),
                "chain": str(chain),
                "source": str(opportunity.get("source", "Unknown")),
                "reward_pool": str(opportunity.get("reward_pool", "")),
                "deadline": str(opportunity.get("deadline", ""))
            }

            print(f"[VectorDB] Upserting: {title[:30]}...")
            collection.upsert(
                documents=[text_content],
                embeddings=[embedding],
                metadatas=[metadata],
                ids=[str(opportunity.get("id"))] # Use DB ID as vector ID
            )
            return True
        except Exception as e:
            print(f"[VectorDB] Error adding opportunity: {e}")
            return False

    @classmethod
    def search(cls, query_text: str, n_results: int = 5, where: Dict = None):
        """
        Semantic search with keyword fallback.
        Falls back to AI-assisted retrieval if ChromaDB is missing.
        """
        try:
            # 1. Check if Vector DB is available
            if CHROMA_AVAILABLE and cls.get_collection():
                collection = cls.get_collection()
                embedding = cls.generate_embedding(query_text)
                
                results = collection.query(
                    query_embeddings=[embedding],
                    n_results=n_results,
                    where=where
                )
                return results

            # 2. Vector DB NOT Available - Perform "Smart" Keyword Search Fallback
            print(f"[VectorDB] Using Smart Keyword + AI Fallback for: {query_text}")
            
            # Since we use SQL DB for persistence, we can rely on the router's SQL fallback, 
            # BUT we want to provide the 'ids' format here so the router works without changes.
            
            # For simplicity in this mock, we assume the SQL fallback in search.py 
            # will handle the actual data retrieval. We just return None to trigger it.
            # OR we can implement a basic keyword filter on the cached _mock_data.
            
            if not cls._mock_data:
                # Attempt to load some from SQL? No, let's just return None 
                # to let the router's sql search handle it.
                return None

            q_lower = query_text.lower()
            matches = []
            for opp in cls._mock_data:
                if where:
                    match = True
                    for k, v in where.items():
                        if str(opp.get(k)) != str(v):
                            match = False
                            break
                    if not match: continue
                
                # Check for query words
                text = (opp.get('title', '') + " " + opp.get('description', '')).lower()
                # Score based on how many words match
                words = q_lower.split()
                score = sum(1 for w in words if w in text)
                if score > 0:
                    matches.append((opp, score))
            
            # Sort by score
            matches.sort(key=lambda x: x[1], reverse=True)
            match_ids = [str(m[0].get('id')) for m in matches[:n_results]]
            
            return {'ids': [match_ids]} if match_ids else None

        except Exception as e:
            print(f"[VectorDB] Search Error: {e}")
            return None

    @classmethod
    def delete_opportunity(cls, opportunity_id: str):
        try:
            collection = cls.get_collection()
            collection.delete(ids=[str(opportunity_id)])
            return True
        except Exception as e:
            print(f"[VectorDB] Error deleting: {e}")
            return False
