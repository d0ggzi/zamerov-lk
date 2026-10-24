from fastapi import Depends
from sqlalchemy.orm import Session

from src.api.dependencies.s3 import get_s3_service
from src.domain.base import get_session
from src.service.document import DocumentService
from src.service.s3 import S3Service


async def get_document_service(
    session: Session = Depends(get_session), s3_service: S3Service = Depends(get_s3_service)
):
    return DocumentService(session, s3_service)
