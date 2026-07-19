import pytest
from unittest.mock import AsyncMock, MagicMock
from neo4j.exceptions import ServiceUnavailable
from app.services.navigation_service import NavigationService

@pytest.mark.asyncio
async def test_navigation_service_success():
    """Test successful Dijkstra shortest path calculation using mocked Neo4j session."""
    mock_driver = MagicMock()
    mock_session = AsyncMock()
    mock_result = AsyncMock()
    
    mock_record = {
        "route": [
            {"id": "GATE-A", "name": "Gate A", "type": "Gate"},
            {"id": "CONC-1", "name": "Concourse 1", "type": "Concourse"},
            {"id": "SEAT-101", "name": "Seat 101", "type": "Seat"}
        ],
        "total_walk_time_s": 180
    }
    
    mock_result.single.return_value = mock_record
    mock_session.run.return_value = mock_result
    
    mock_session_ctx = AsyncMock()
    mock_session_ctx.__aenter__.return_value = mock_session
    mock_session_ctx.__aexit__.return_value = None
    mock_driver.session.return_value = mock_session_ctx

    res = await NavigationService.get_route(
        driver=mock_driver,
        from_id="GATE-A",
        to_id="SEAT-101",
        stadium_id="STAD-01",
        mode="shortest"
    )

    assert res.route_id == "rt-GATE-A-SEAT-101"
    assert res.mode == "shortest"
    assert len(res.segments) == 3
    assert res.total_walk_time_s == 180

@pytest.mark.asyncio
async def test_navigation_service_eco_transit():
    """Test Eco-Transit green shuttle routing mode using ECO_TRANSIT_PATH_QUERY."""
    mock_driver = MagicMock()
    mock_session = AsyncMock()
    mock_result = AsyncMock()
    
    mock_record = {
        "route": [
            {"id": "GATE-A", "name": "Gate A", "type": "Gate"},
            {"id": "ECO-SHUTTLE-1", "name": "Green Transit Shuttle", "type": "Shuttle"},
            {"id": "SEAT-101", "name": "Seat 101", "type": "Seat"}
        ],
        "total_walk_time_s": 120
    }
    
    mock_result.single.return_value = mock_record
    mock_session.run.return_value = mock_result
    
    mock_session_ctx = AsyncMock()
    mock_session_ctx.__aenter__.return_value = mock_session
    mock_session_ctx.__aexit__.return_value = None
    mock_driver.session.return_value = mock_session_ctx

    res = await NavigationService.get_route(
        driver=mock_driver,
        from_id="GATE-A",
        to_id="SEAT-101",
        stadium_id="STAD-01",
        mode="eco_transit"
    )

    assert res.route_id == "rt-GATE-A-SEAT-101"
    assert res.mode == "eco_transit"
    assert len(res.segments) == 3
    assert res.total_walk_time_s == 120

@pytest.mark.asyncio
async def test_navigation_service_neo4j_down_fallback():
    """Verify that database connectivity failure falls back to in-memory graph traversal."""
    mock_driver = MagicMock()
    mock_session_ctx = AsyncMock()
    mock_session_ctx.__aenter__.side_effect = ServiceUnavailable("Could not connect to Neo4j AuraDB")
    mock_driver.session.return_value = mock_session_ctx

    res = await NavigationService.get_route(
        driver=mock_driver,
        from_id="GATE-A",
        to_id="SEAT-101",
        stadium_id="STAD-01",
        mode="eco_transit"
    )

    assert res.route_id == "rt-GATE-A-SEAT-101"
    assert res.mode == "eco_transit"
    assert any("ECO-SHUTTLE" in s["id"] for s in res.segments)
    assert res.total_walk_time_s == 105.0