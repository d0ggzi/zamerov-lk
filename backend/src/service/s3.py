from datetime import datetime

import boto3

from src.settings.config import settings


class S3Service:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            endpoint_url=settings.YANDEX_S3_ENDPOINT,
            aws_access_key_id=settings.YANDEX_S3_ACCESS_KEY,
            aws_secret_access_key=settings.YANDEX_S3_SECRET_KEY,
        )

    def get_presigned_url(self, filename: str, content_type: str) -> tuple[str, str]:
        object_name = f"photos/{datetime.utcnow().timestamp()}_{filename}"
        presigned_url = self.s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': settings.YANDEX_S3_BUCKET_NAME,
                'Key': object_name,
                'ContentType': content_type
            },
            ExpiresIn=300
        )
        public_url = f"{settings.YANDEX_S3_ENDPOINT}/{settings.YANDEX_S3_BUCKET_NAME}/{object_name}"
        return presigned_url, public_url

s3_service = S3Service()
