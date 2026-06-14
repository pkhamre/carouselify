import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.models import User
from app.users import current_active_user

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}
MAX_SIZE = 2 * 1024 * 1024  # 2MB


@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    user: User = Depends(current_active_user),
):
    if not user.is_premium:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, detail="Premium required")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, detail="Only PNG, JPEG, WebP, GIF allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(400, detail="File too large (max 2MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "png"
    filename = f"{user.id}-{uuid.uuid4()}.{ext}"

    upload_dir = Path("uploads/logos")
    upload_dir.mkdir(parents=True, exist_ok=True)

    (upload_dir / filename).write_bytes(contents)

    url = f"/uploads/logos/{filename}"
    return {"url": url}
