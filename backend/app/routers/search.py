from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models.opportunity import Opportunity
from ..services.vector_db import VectorDBService

router = APIRouter(
    prefix="/search",
    tags=["search"]
)

class SearchResult(BaseModel):
    id: str
    title: str
    description: str
    category: Optional[str] = None
    chain: Optional[str] = None
    relevance_score: Optional[float] = None
    url: str

class SearchResponse(BaseModel):
    results: List[SearchResult]
    total_found: int
    query: str

@router.get("/", response_model=SearchResponse)
def search_ops(q: str, limit: int = 10, category: Optional[str] = None, chain: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Search opportunities using semantic vector search powered by ChromaDB.
    Falls back to SQL ILIKE search if VectorDB is unavailable or returns no results.
    """
    if not q:
        return {"results": [], "total_found": 0, "query": ""}

    found_ids = []
    vector_results = None

    # 1. Try Vector Search
    try:
        where_filter = {}
        if category: where_filter["category"] = category
        if chain: where_filter["chain"] = chain
        
        vector_results = VectorDBService.search(q, n_results=limit, where=where_filter if where_filter else None)
    except Exception as e:
        print(f"[Search] Vector search failed: {e}")

    # Process Vector Results
    if vector_results and vector_results.get('ids') and vector_results['ids'][0]:
        # Chroma returns list of lists
        found_ids = vector_results['ids'][0]
        # relevance_scores = vector_results['distances'][0] if 'distances' in vector_results else []
    
    results = []
    
    # 2. Fetch from DB
    if found_ids:
        # Preserve order of IDs (relevance)
        # SQLAlchemy IN clause doesn't guarantee order, so we fetch all and sort in Python
        opps = db.query(Opportunity).filter(Opportunity.id.in_(found_ids)).all()
        opp_map = {str(o.id): o for o in opps}
        
        for oid in found_ids:
            if oid in opp_map:
                o = opp_map[oid]
                results.append(SearchResult(
                    id=str(o.id),
                    title=o.title,
                    description=o.description,
                    category=o.category,
                    chain=o.chain,
                    relevance_score=0.9, # Placeholder
                    url=o.url
                ))
    
    # 3. Fallback to SQL Search if vector search yielded nothing or very few results
    if len(results) < 2:
        print(f"[Search] Falling back to SQL search for '{q}'")
        sql_query = db.query(Opportunity).filter(
            Opportunity.title.ilike(f"%{q}%") | Opportunity.description.ilike(f"%{q}%")
        )
        if category:
            sql_query = sql_query.filter(Opportunity.category == category)
        if chain:
            sql_query = sql_query.filter(Opportunity.chain == chain)
            
        sql_opps = sql_query.limit(limit).all()
        
        existing_ids = set(r.id for r in results)
        for o in sql_opps:
            if str(o.id) not in existing_ids:
                results.append(SearchResult(
                    id=str(o.id),
                    title=o.title,
                    description=o.description,
                    category=o.category,
                    chain=o.chain,
                    relevance_score=0.5, # Lower score for keyword match
                    url=o.url
                ))

    return {
        "results": results[:limit],
        "total_found": len(results),
        "query": q
    }
