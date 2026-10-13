from dataclasses import dataclass
from datetime import datetime, timezone

from app.models import User

CREDITS_GUEST = 5
CREDITS_REGISTERED = 10
CREDITS_PREMIUM = 100

# ponytail: lambda avoided; keep tz-naive to match column type
def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


@dataclass
class Balance:
    used: int
    limit: int
    remaining: int
    resets_at: datetime | None


@dataclass
class EntitlementResult:
    ok: bool
    balance: Balance


def _limit(user: User) -> int:
    if user.is_guest:
        return CREDITS_GUEST
    if user.is_premium or user.is_admin:
        return CREDITS_PREMIUM
    return CREDITS_REGISTERED


def _effective_used(user: User, now: datetime) -> int:
    if user.is_guest:
        # ai_free_used preserves the one-credit guest allowance from older versions.
        return max(user.ai_credits_used or 0, 1 if user.ai_free_used else 0)
    if (user.is_premium or user.is_admin) and user.ai_credits_reset_at:
        if user.ai_credits_reset_at.replace(tzinfo=None) < now:
            return 0
    return user.ai_credits_used or 0


def balance(user: User) -> Balance:
    """Read-only, reset-aware snapshot of the user's entitlement. Does not mutate."""
    used = _effective_used(user, _now())
    limit = _limit(user)
    resets_at = user.ai_credits_reset_at if (user.is_premium or user.is_admin) else None
    return Balance(used=used, limit=limit, remaining=max(0, limit - used), resets_at=resets_at)


def check(user: User) -> EntitlementResult:
    """Whether the user may consume a credit. Callers map 'not ok' to their own response."""
    b = balance(user)
    return EntitlementResult(ok=b.remaining > 0, balance=b)


def deduct(user: User) -> tuple[int, int]:
    """Consume one credit, mutating user fields only. Caller owns the commit.

    Returns (deducted_this_call, remaining) — deducted is 0 for guests.
    """
    now = _now()
    if user.is_guest:
        user.ai_credits_used = (user.ai_credits_used or 0) + 1
        user.ai_free_used = True
        return (0, max(0, CREDITS_GUEST - user.ai_credits_used))
    if user.is_premium or user.is_admin:
        if user.ai_credits_reset_at and user.ai_credits_reset_at.replace(tzinfo=None) < now:
            user.ai_credits_used = 0
        user.ai_credits_used = (user.ai_credits_used or 0) + 1
        return (1, max(0, CREDITS_PREMIUM - user.ai_credits_used))
    user.ai_credits_used = (user.ai_credits_used or 0) + 1
    return (1, max(0, CREDITS_REGISTERED - user.ai_credits_used))
