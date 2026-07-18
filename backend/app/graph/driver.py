from neo4j import AsyncGraphDatabase
from app.config import settings

class Neo4jDriver:
    _instance = None

    @classmethod
    def get_driver(cls):
        """Construct and return a new AsyncDriver instance.
        
        Used for connection-per-request pattern in serverless environments.
        """
        return AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password)
        )

    @classmethod
    def get_instance(cls):
        """Get the singleton driver instance (deprecated for serverless)."""
        if cls._instance is None:
            cls._instance = cls.get_driver()
        return cls._instance

    @classmethod
    async def close_instance(cls):
        """Close the singleton driver instance (deprecated for serverless)."""
        if cls._instance is not None:
            await cls._instance.close()
            cls._instance = None
