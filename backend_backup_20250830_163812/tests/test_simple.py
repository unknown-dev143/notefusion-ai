"""Simple test to verify pytest is working."""
import pytest

def test_addition():
    """Test basic addition."""
    assert 1 + 1 == 2

@pytest.mark.asyncio
async def test_async_addition():
    """Test async test execution."""
    assert await some_async_function() == 2

async def some_async_function():
    """Simple async function for testing."""
    return 1 + 1
