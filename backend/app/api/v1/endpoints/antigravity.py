"""
Antigravity API Endpoint
=======================

This module provides API endpoints for the antigravity feature.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

from app.utils.antigravity_handler import (
    get_antigravity_handler,
    safe_antigravity_execute,
    is_antigravity_feature,
    get_antigravity_documentation
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/antigravity", tags=["antigravity"])

@router.get("/status")
async def get_antigravity_status() -> Dict[str, Any]:
    """
    Get the current status of the antigravity feature.
    
    Returns:
        Dictionary containing antigravity status information
    """
    try:
        handler = get_antigravity_handler(enabled=True)
        status = handler.get_status()
        return {
            "success": True,
            "data": status,
            "message": "Antigravity status retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting antigravity status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/info")
async def get_antigravity_info() -> Dict[str, Any]:
    """
    Get information about the antigravity feature.
    
    Returns:
        Dictionary containing antigravity feature information
    """
    try:
        handler = get_antigravity_handler(enabled=True)
        info = handler.get_info()
        return {
            "success": True,
            "data": info,
            "message": "Antigravity info retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting antigravity info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute")
async def execute_antigravity(safe_mode: bool = True) -> Dict[str, Any]:
    """
    Execute the antigravity functionality.
    
    Args:
        safe_mode: If True, prevents actual browser opening
        
    Returns:
        Dictionary containing execution results
    """
    try:
        result = safe_antigravity_execute(safe_mode=safe_mode)
        return {
            "success": True,
            "data": result,
            "message": "Antigravity execution completed"
        }
    except Exception as e:
        logger.error(f"Error executing antigravity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/is-feature")
async def check_if_feature() -> Dict[str, Any]:
    """
    Check if antigravity is considered a feature.
    
    Returns:
        Dictionary containing feature check result
    """
    try:
        is_feature = is_antigravity_feature()
        return {
            "success": True,
            "data": {
                "is_feature": is_feature,
                "explanation": "Yes! Google's antigravity is officially a feature of Python's standard library"
            },
            "message": "Feature check completed"
        }
    except Exception as e:
        logger.error(f"Error checking antigravity feature: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/docs")
async def get_documentation() -> Dict[str, Any]:
    """
    Get documentation about the antigravity feature.
    
    Returns:
        Dictionary containing documentation
    """
    try:
        docs = get_antigravity_documentation()
        return {
            "success": True,
            "data": {
                "documentation": docs
            },
            "message": "Documentation retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting antigravity documentation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test")
async def test_antigravity() -> Dict[str, Any]:
    """
    Test the antigravity functionality comprehensively.
    
    Returns:
        Dictionary containing test results
    """
    try:
        results = {}
        
        # Test 1: Check if it's a feature
        results["is_feature"] = is_antigravity_feature()
        
        # Test 2: Get handler status
        handler = get_antigravity_handler(enabled=True)
        results["status"] = handler.get_status()
        
        # Test 3: Get info
        results["info"] = handler.get_info()
        
        # Test 4: Safe execution
        results["safe_execution"] = safe_antigravity_execute(safe_mode=True)
        
        # Test 5: Documentation
        results["documentation_available"] = len(get_antigravity_documentation()) > 0
        
        return {
            "success": True,
            "data": {
                "test_results": results,
                "summary": {
                    "total_tests": 5,
                    "passed": sum([
                        results["is_feature"],
                        results["status"]["module_loaded"] if results["status"] else False,
                        bool(results["info"]),
                        results["safe_execution"]["success"] if results["safe_execution"] else False,
                        results["documentation_available"]
                    ])
                }
            },
            "message": "Antigravity tests completed successfully"
        }
    except Exception as e:
        logger.error(f"Error testing antigravity: {e}")
        raise HTTPException(status_code=500, detail=str(e))
