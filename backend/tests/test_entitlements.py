from datetime import datetime, timedelta, timezone

from app.entitlements import balance, check, deduct


def now():
    return datetime.now(timezone.utc)


def test_guest_gets_five_credits():
    user = type("U", (), dict(is_guest=True, is_premium=False, is_admin=False, ai_free_used=False, ai_credits_used=0))()

    assert check(user).ok
    assert balance(user).limit == 5
    assert balance(user).remaining == 5

    for remaining in range(4, -1, -1):
        deducted, rem = deduct(user)
        assert deducted == 0
        assert rem == remaining

    assert user.ai_free_used is True
    assert not check(user).ok
    assert balance(user).remaining == 0


def test_legacy_guest_credit_stays_consumed():
    user = type("U", (), dict(is_guest=True, is_premium=False, is_admin=False, ai_free_used=True, ai_credits_used=0))()

    assert balance(user).remaining == 4


def test_registered_credit_counts_down_to_zero():
    user = type(
        "U",
        (),
        dict(is_guest=False, is_premium=False, is_admin=False, ai_free_used=False, ai_credits_used=0, ai_credits_reset_at=None),
    )()

    assert balance(user).limit == 10
    assert check(user).ok

    for remaining in range(9, -1, -1):
        deducted, rem = deduct(user)
        assert deducted == 1
        assert rem == remaining

    assert not check(user).ok


def test_premium_reset_window_rolls_over():
    user = type(
        "U",
        (),
        dict(
            is_guest=False,
            is_premium=True,
            is_admin=False,
            ai_free_used=False,
            ai_credits_used=100,
            ai_credits_reset_at=now() - timedelta(days=1),
        ),
    )()

    # past reset date -> effective used is 0, so credits are available again
    assert balance(user).used == 0
    assert balance(user).remaining == 100
    assert check(user).ok

    deducted, rem = deduct(user)
    assert deducted == 1
    assert rem == 99
    assert user.ai_credits_used == 1


def test_premium_within_window_is_exhausted():
    user = type(
        "U",
        (),
        dict(
            is_guest=False,
            is_premium=True,
            is_admin=False,
            ai_free_used=False,
            ai_credits_used=100,
            ai_credits_reset_at=now() + timedelta(days=10),
        ),
    )()

    assert not check(user).ok
    assert balance(user).remaining == 0
