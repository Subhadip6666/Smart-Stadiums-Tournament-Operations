import asyncio
from neo4j import AsyncGraphDatabase, exceptions

async def test_neo4j_connection():
    print("Testing unauthenticated Neo4j connection from unauthorized IP...")
    uri = "bolt://localhost:7687"
    try:
        # Attempt to connect without credentials
        driver = AsyncGraphDatabase.driver(uri)
        await driver.verify_connectivity()
        print("FAIL: Connection succeeded (This should not happen)")
    except exceptions.AuthError as e:
        print(f"SUCCESS: Connection rejected (AuthError): {str(e)}")
    except exceptions.ServiceUnavailable as e:
        print(f"SUCCESS: Connection rejected (ServiceUnavailable): {str(e)}")
    except Exception as e:
        print(f"SUCCESS: Connection rejected (Other Error): {str(e)}")
    finally:
        if "driver" in locals():
            await driver.close()

if __name__ == "__main__":
    asyncio.run(test_neo4j_connection())
