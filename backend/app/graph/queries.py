# Graph queries with strict parameterization

SHORTEST_PATH_QUERY = """
MATCH (start {id: $from_id})-[:GATE_TO_ZONE|CONNECTED_TO*0..1]->(startZone:Zone),
      (end {id: $to_id})
CALL apoc.algo.dijkstra(startZone, end, 'CONNECTED_TO', 'walk_time_s')
YIELD path, weight AS total_walk_time_s
RETURN [n IN nodes(path) | {id: n.id, name: n.name, type: n.type}] AS route,
       total_walk_time_s
ORDER BY total_walk_time_s
LIMIT 1
"""

ACCESSIBLE_PATH_QUERY = """
MATCH (start {id: $from_id, is_accessible: true})-[:GATE_TO_ZONE|CONNECTED_TO*0..1]->(startZone:Zone),
      (end {id: $to_id})
CALL apoc.algo.dijkstra(
  startZone, end, 'CONNECTED_TO>',
  'walk_time_s',
  {relationshipFilter: 'CONNECTED_TO', nodeFilter: 'Zone', 
   nodeProperties: {is_accessible: true},
   relProperties: {is_accessible: true}}
)
YIELD path, weight AS total_walk_time_s
RETURN [n IN nodes(path) | {id: n.id, name: n.name, type: n.type}] AS route,
       total_walk_time_s
LIMIT 1
"""
