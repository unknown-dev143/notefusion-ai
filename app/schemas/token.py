from pydantic import BaseModel
from typing import Optional, Dict, Any

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None
