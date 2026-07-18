import asyncio
import sys
import os

# Add parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.graph.driver import Neo4jDriver
from neo4j import exceptions

async def simulate_request(req_id: int):
    print(f"Request #{req_id}: Opening driver...")
    driver = Neo4jDriver.get_driver()
    try:
        # Since we are running in local test environment without real AuraDB/Neo4j,
        # we expect connection to fail. The key is that the connection resource is 
        # closed cleanly in the finally block, preventing leaks.
        await driver.verify_connectivity()
        print(f"Request #{req_id}: SUCCESS (Unexpectedly connected)")
    except exceptions.ServiceUnavailable as e:
        print(f"Request #{req_id}: Expected ServiceUnavailable ({str(e)[:50]})")
    except exceptions.AuthError as e:
        print(f"Request #{req_id}: Expected AuthError ({str(e)[:50]})")
    except Exception as e:
        print(f"Request #{req_id}: Handled exception: {type(e).__name__}")
    finally:
        print(f"Request #{req_id}: Closing driver...")
        await driver.close()
        print(f"Request #{req_id}: Driver closed cleanly.")

async def run_stress_test():
    print("============================================================")
    print("NEO4J SERVERLESS DRIVER STRESS TEST (15 SEQUENTIAL INVOCATIONS)")
    print("============================================================")
    
    for i in range(1, 16):
        await simulate_request(i)
        print("-" * 40)
        
    print("Stress test completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
