from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.collection_action import CollectionAction
from app.models.loan import Loan
from app.models.user import User, UserRole
from app.schemas.collection_action import CollectionActionCreate, CollectionActionRead

router = APIRouter(prefix="/collections", tags=["collections"])


@router.post("", response_model=CollectionActionRead)
def log_collection_action(
    payload: CollectionActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.staff, UserRole.collector)),
):
    loan = db.query(Loan).filter(Loan.id == payload.loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    action = CollectionAction(
        loan_id=payload.loan_id,
        staff_id=current_user.id,
        action_type=payload.action_type,
        notes=payload.notes,
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


@router.get("", response_model=list[CollectionActionRead])
def list_collection_actions(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(CollectionAction).order_by(CollectionAction.id.desc()).all()
