"""
Backend Health Check Script
--------------------------
This script checks the health of the NoteFusion AI backend by:
1. Verifying the Python environment
2. Testing database connectivity
3. Checking API endpoints
4. Validating configuration
"""

import os
import sys
import asyncio
import platform
import logging
from pathlib import Path
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("backend_health_check")

# Add backend directory to Python path
BACKEND_DIR = Path(__file__).parent.resolve()
sys.path.append(str(BACKEND_DIR))

class BackendHealthCheck:
    def __init__(self):
        self.results: Dict[str, Dict[str, Any]] = {}
        self.environment: Dict[str, str] = {}
        
    async def run_checks(self):
        """Run all health checks"""
        self._collect_environment_info()
        await self._check_database()
        await self._check_api_endpoints()
        self._print_summary()
    
    def _collect_environment_info(self):
        """Collect information about the environment"""
        self.environment = {
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "working_directory": str(Path.cwd()),
            "backend_directory": str(BACKEND_DIR),
            "python_path": ":".join(sys.path)
        }
        
        logger.info("Environment Information:")
        for key, value in self.environment.items():
            logger.info(f"  {key}: {value}")
    
    async def _check_database(self):
        """Check database connectivity"""
        self.results["database"] = {"status": "pending", "message": ""}
        
        try:
            from sqlalchemy import text
            from sqlalchemy.ext.asyncio import create_async_engine
            from app.config.settings import settings
            
            logger.info("\nTesting database connection...")
            
            # Create async engine
            engine = create_async_engine(
                str(settings.DATABASE_URL),
                echo=False,
                pool_pre_ping=True
            )
            
            # Test connection
            async with engine.connect() as conn:
                # Test a simple query
                result = await conn.execute(text("SELECT 1"))
                test_result = result.scalar()
                
                if test_result == 1:
                    self.results["database"]["status"] = "success"
                    self.results["database"]["message"] = "Successfully connected to database"
                    logger.info("✅ Database connection successful")
                else:
                    self.results["database"]["status"] = "error"
                    self.results["database"]["message"] = "Unexpected query result"
                    logger.error("❌ Database query returned unexpected result")
            
            await engine.dispose()
            
        except Exception as e:
            self.results["database"]["status"] = "error"
            self.results["database"]["message"] = str(e)
            logger.error(f"❌ Database connection failed: {e}")
    
    async def _check_api_endpoints(self):
        """Check API endpoints"""
        self.results["api"] = {"status": "pending", "message": ""}
        
        try:
            import httpx
            from app.config.settings import settings
            
            base_url = f"http://{settings.HOST}:{settings.PORT}{settings.API_V1_STR}"
            endpoints = [
                "/health",
                "/docs",
                "/openapi.json"
            ]
            
            logger.info("\nTesting API endpoints...")
            
            async with httpx.AsyncClient() as client:
                for endpoint in endpoints:
                    url = f"{base_url}{endpoint}"
                    try:
                        response = await client.get(url, timeout=5.0)
                        status = "✅" if response.status_code < 400 else "❌"
                        logger.info(f"{status} {endpoint}: {response.status_code}")
                        
                        if response.status_code >= 400:
                            self.results["api"]["status"] = "warning"
                            self.results["api"]["message"] = f"Endpoint {endpoint} returned {response.status_code}"
                            
                    except Exception as e:
                        logger.error(f"❌ {endpoint}: {str(e)}")
                        self.results["api"]["status"] = "error"
                        self.results["api"]["message"] = f"Failed to access {endpoint}: {str(e)}"
                        break
                else:
                    if self.results["api"]["status"] == "pending":
                        self.results["api"]["status"] = "success"
                        self.results["api"]["message"] = "All endpoints are accessible"
            
        except Exception as e:
            self.results["api"]["status"] = "error"
            self.results["api"]["message"] = f"API check failed: {str(e)}"
            logger.error(f"❌ API check failed: {e}")
    
    def _print_summary(self):
        """Print a summary of the health check results"""
        print("\n" + "=" * 50)
        print("BACKEND HEALTH CHECK SUMMARY")
        print("=" * 50)
        
        # Print environment info
        print("\nENVIRONMENT:")
        for key, value in self.environment.items():
            print(f"  {key}: {value}")
        
        # Print check results
        print("\nCHECKS:")
        for check_name, result in self.results.items():
            status = result["status"].upper()
            message = result["message"]
            
            if status == "SUCCESS":
                status_display = f"\033[92m{status}\\033[0m"  # Green
            elif status == "WARNING":
                status_display = f"\033[93m{status}\\033[0m"  # Yellow
            else:
                status_display = f"\033[91m{status}\\033[0m"  # Red
                
            print(f"  {check_name.upper():<10} {status_display} - {message}")
        
        print("\n" + "=" * 50 + "\n")

async def main():
    """Main function"""
    health_check = BackendHealthCheck()
    await health_check.run_checks()

if __name__ == "__main__":
    asyncio.run(main())
