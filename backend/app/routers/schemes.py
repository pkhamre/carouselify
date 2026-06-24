import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import CustomScheme, User
from app.schemas import CustomSchemeCreate, CustomSchemeOut, CustomSchemeUpdate
from app.users import current_active_user

router = APIRouter(prefix="/api/schemes", tags=["schemes"])


@router.get("", response_model=list[CustomSchemeOut])
async def list_schemes(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(CustomScheme)
        .where(CustomScheme.user_id == user.id)
        .order_by(CustomScheme.created_at)
    )
    return result.scalars().all()


@router.post("", response_model=CustomSchemeOut, status_code=status.HTTP_201_CREATED)
async def create_scheme(
    data: CustomSchemeCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    scheme = CustomScheme(
        user_id=user.id,
        name=data.name,
        background=data.background,
        accent=data.accent,
        text_primary=data.text_primary,
        text_on_accent=data.text_on_accent,
        bg_on_accent=data.bg_on_accent,
    )
    session.add(scheme)
    await session.commit()
    await session.refresh(scheme)
    return scheme


@router.put("/{scheme_id}", response_model=CustomSchemeOut)
async def update_scheme(
    scheme_id: uuid.UUID,
    data: CustomSchemeUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(CustomScheme).where(
            CustomScheme.id == scheme_id,
            CustomScheme.user_id == user.id,
        )
    )
    scheme = result.scalar_one_or_none()
    if not scheme:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(scheme, field, value)

    await session.commit()
    await session.refresh(scheme)
    return scheme


@router.delete("/{scheme_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scheme(
    scheme_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(CustomScheme).where(
            CustomScheme.id == scheme_id,
            CustomScheme.user_id == user.id,
        )
    )
    scheme = result.scalar_one_or_none()
    if not scheme:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    await session.delete(scheme)
    await session.commit()
