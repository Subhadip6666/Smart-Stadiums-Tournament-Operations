# ADR 001: Selection of Neo4j Graph Database over Relational Datastores

## Status
Accepted

## Context
Stadium wayfinding and spatial layout modeling require traversing complex physical graph structures (gates, concourses, escalators, ramps, seating sections) with variable edge traversal costs and accessibility constraints. Relational databases require expensive recursive CTE queries to perform Dijkstra shortest-path calculations.

## Decision
Adopt **Neo4j AuraDB** graph database using native Cypher parameterized queries (`apoc.algo.dijkstra`).

## Consequences
- Native traversal performance (< 15ms Dijkstra route calculations).
- Flexible graph schema modeling for temporary corridor closures.
- Handled gracefully via `NavigationService` with 503 fallback when connection is offline.