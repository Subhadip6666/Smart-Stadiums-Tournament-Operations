"""Cypher database seed script for StadiumAI NOC graph topology."""

SEED_CYPHER = """
// 1. Create Stadium Nodes
MERGE (s:Stadium {id: 'STAD-01', name: 'FIFA MetLife Stadium', city: 'East Rutherford'})

// 2. Create Gates & Entrances
MERGE (gA:Gate {id: 'GATE-A', name: 'Gate A - Main North Entrance', is_accessible: true})
MERGE (gB:Gate {id: 'GATE-B', name: 'Gate B - East Concourse Entrance', is_accessible: true})

// 3. Create Zones
MERGE (zNorth:Zone {id: 'Z-CONC-N', name: 'North Concourse Plaza', is_accessible: true})
MERGE (zEast:Zone {id: 'Z-GATE-E', name: 'East Gate Security Zone', is_accessible: true})
MERGE (zShuttle:Zone {id: 'ECO-SHUTTLE-01', name: 'FIFA Green Electric Shuttle Stop', is_accessible: true})
MERGE (zSeat:Zone {id: 'Z-SEAT-W1', name: 'West Lower Bowl Section 101', is_accessible: true})

// 4. Create Standard Pedestrian Connections
MERGE (gA)-[:GATE_TO_ZONE {walk_time_s: 30.0, is_accessible: true}]->(zNorth)
MERGE (zNorth)-[:CONNECTED_TO {walk_time_s: 150.0, is_accessible: true, eco_transit: false}]->(zEast)
MERGE (zEast)-[:CONNECTED_TO {walk_time_s: 120.0, is_accessible: true, eco_transit: false}]->(zSeat)

// 5. Create Eco-Transit Electric Shuttle Connections
MERGE (zNorth)-[:SHUTTLE_ROUTE {walk_time_s: 45.0, is_accessible: true, eco_transit: true}]->(zShuttle)
MERGE (zShuttle)-[:SHUTTLE_ROUTE {walk_time_s: 30.0, is_accessible: true, eco_transit: true}]->(zSeat)
"""

async def seed_stadium_graph(driver):
    """Executes the Cypher seed script against the active Neo4j database driver."""
    async with driver.session() as session:
        await session.run(SEED_CYPHER)