from neo4j import AsyncGraphDatabase
from app.config import settings

class Neo4jDriver:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = AsyncGraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password)
            )
        return cls._instance

    @classmethod
    async def close_instance(cls):
        if cls._instance is not None:
            await cls._instance.close()
            cls._instance = None
