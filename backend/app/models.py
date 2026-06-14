import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text
from fastapi_users.db import SQLAlchemyBaseUserTableUUID

from app.database import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"

    carousels = relationship("Carousel", back_populates="user", cascade="all, delete-orphan")


class Carousel(Base):
    __tablename__ = "carousel"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled")
    data = Column(JSONB, nullable=False, default=dict)
    is_public = Column(Boolean, default=False, nullable=False)
    share_token = Column(UUID(as_uuid=True), unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    user = relationship("User", back_populates="carousels")
