from app.graph.queries import SHORTEST_PATH_QUERY, ACCESSIBLE_PATH_QUERY

def test_cypher_queries_structure():
    """Verify Neo4j Cypher query parameter formatting."""
    assert "$from_id" in SHORTEST_PATH_QUERY
    assert "$to_id" in SHORTEST_PATH_QUERY
    assert "is_accessible: true" in ACCESSIBLE_PATH_QUERY