import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON, func, UniqueConstraint
from sqlalchemy.orm import relationship
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from fastapi_users_db_sqlalchemy.generics import GUID

from app.database import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"

    is_guest = Column(Boolean, default=False, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    lemon_squeezy_customer_id = Column(String, nullable=True, index=True)
    lemon_squeezy_subscription_id = Column(String, nullable=True)
    ai_credits_used = Column(Integer, default=0, nullable=False)
    ai_credits_reset_at = Column(DateTime(timezone=True), nullable=True)
    carousels = relationship("Carousel", back_populates="user", cascade="all, delete-orphan")
    custom_schemes = relationship("CustomScheme", back_populates="user", cascade="all, delete-orphan")


class Carousel(Base):
    __tablename__ = "carousel"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled")
    data = Column(JSON, nullable=False, default=dict)
    is_public = Column(Boolean, default=False, nullable=False)
    share_token = Column(GUID, unique=True, nullable=True, index=True)
    showcased = Column(Boolean, default=False, nullable=False)
    showcase_author = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="carousels")


class Event(Base):
    __tablename__ = "event"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    event_type = Column(String(50), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True)
    carousel_id = Column(GUID, ForeignKey("carousel.id", ondelete="SET NULL"), nullable=True, index=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    user = relationship("User")
    carousel = relationship("Carousel")


class CustomScheme(Base):
    __tablename__ = "custom_scheme"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    background = Column(String, nullable=False)
    accent = Column(String, nullable=False)
    text_primary = Column(String, nullable=False)
    text_on_accent = Column(String, nullable=False)
    bg_on_accent = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="custom_schemes")


class ContactMessage(Base):
    __tablename__ = "contact_message"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    message = Column(String(5000), nullable=False)
    archived = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class CarouselLike(Base):
    __tablename__ = "carousel_like"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    carousel_id = Column(GUID, ForeignKey("carousel.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint("carousel_id", "user_id", name="uq_carousel_user_like"),)
