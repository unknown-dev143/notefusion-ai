"""
app/core/token_store.py
-----------------------
In-memory token blacklist for one-time-use tokens (password reset, email
verification, etc.).

How it works
------------
- When a single-use token is *issued* we do nothing special.
- When a token is *consumed* (used), we call  revoke(token).
- Before trusting a token we call  is_revoked(token) — if it was already
  used, the check returns True and the endpoint rejects it.
- A background cleanup task removes expired entries every 10 minutes so the
  dict never grows unbounded.

Why in-memory (not Redis)?
--------------------------
No external dependency required.  Single-process deployments (Railway, Render
free tier, etc.) work perfectly.  For multi-process / Kubernetes you can swap
the dict for a Redis SET — the interface stays identical.
"""

import asyncio
import time
import logging
from typing import Dict

logger = logging.getLogger(__name__)

# Internal store:  token_jti  →  unix expiry timestamp
# We store the *expiry* so we can clean up stale entries without ever
# having to parse the JWT again.
_blacklist: Dict[str, float] = {}
_cleanup_interval_seconds: int = 600   # run cleanup every 10 minutes


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def revoke(token: str, expires_in_seconds: int = 900) -> None:
    """Add a token to the blacklist.

    Args:
        token:              Raw JWT string (we use it as the key).
        expires_in_seconds: How many seconds until the token would expire
                            naturally.  We keep the entry that long so we
                            can correctly reject late re-use attempts.
                            Default = 15 minutes (900 s), matching the
                            reset-token lifetime.
    """
    _blacklist[token] = time.monotonic() + expires_in_seconds
    logger.debug("Token revoked; blacklist size=%d", len(_blacklist))


def is_revoked(token: str) -> bool:
    """Return True if the token has been revoked (already used)."""
    expiry = _blacklist.get(token)
    if expiry is None:
        return False
    # Entry exists – still within window, so token IS revoked
    if time.monotonic() < expiry:
        return True
    # Entry has naturally expired – remove it and treat as not-revoked
    # (The token is also expired at the JWT level, so it would be rejected
    #  by the JWT verifier anyway.)
    del _blacklist[token]
    return False


def cleanup() -> int:
    """Remove all entries whose TTL has passed. Returns number removed."""
    now = time.monotonic()
    stale = [k for k, v in _blacklist.items() if v <= now]
    for k in stale:
        del _blacklist[k]
    if stale:
        logger.debug("Token blacklist cleanup: removed %d stale entries", len(stale))
    return len(stale)


# ---------------------------------------------------------------------------
# Background cleanup coroutine (started on FastAPI startup)
# ---------------------------------------------------------------------------

async def start_cleanup_loop() -> None:
    """Run cleanup every `_cleanup_interval_seconds` seconds forever."""
    while True:
        await asyncio.sleep(_cleanup_interval_seconds)
        try:
            removed = cleanup()
            logger.info("Token blacklist periodic cleanup: %d entries removed", removed)
        except Exception as exc:   # pragma: no cover
            logger.error("Token blacklist cleanup error: %s", exc)
