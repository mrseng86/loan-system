from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.perkeso import PerkesoQueryRequest, PerkesoQueryResponse
from app.services.perkeso_service import query_perkeso

router = APIRouter(prefix="/perkeso", tags=["perkeso"])


@router.post("/check", response_model=PerkesoQueryResponse)
def check_perkeso(
    payload: PerkesoQueryRequest,
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff, UserRole.collector)),
):
    try:
        return query_perkeso(payload.national_id, payload.legacy_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
