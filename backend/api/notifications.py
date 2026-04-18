# This file contains the API endpoints for notification-related operations
# It defines routes for patients to view their notifications.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.deps import get_current_user, require_doctor
from db.session import get_db
from models.user import User
from models.assessment import Assessment
from models.notifications import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Get notifications for the current user
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
    )
    
    notifications = result.scalars().all()

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "created_at": n.created_at,
            "is_read": n.is_read
        }
        for n in notifications
    ]
    
# Endpoint to get count of unread notifications for the current user
@router.post("/count")
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Get count of unread notifications for the current user
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user.id, Notification.is_read == False)
    )
    
    unread_count = result.scalars().all()

    return {"unread_count": len(unread_count)}

# Endpoint to mark a notification as read
@router.post("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Get the notification
    result = await db.execute(
        select(Notification)
        .where(Notification.id == notification_id, Notification.user_id == user.id)
    )
    notification = result.scalar_one_or_none()

    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")

    # Mark the notification as read
    notification.is_read = True
    await db.commit()

    return {"message": "Notification marked as read"}


@router.get("/read-all")
async def mark_all_notifications_as_read(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Get all unread notifications for the current user
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user.id, Notification.is_read == False)
    )
    notifications = result.scalars().all()

    # Mark all notifications as read
    for notification in notifications:
        notification.is_read = True

    await db.commit()

    return {"message": f"{len(notifications)} notifications marked as read"}

