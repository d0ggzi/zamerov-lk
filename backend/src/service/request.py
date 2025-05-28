from sqlalchemy.orm import Session


class RequestService:
    def __init__(self, session: Session):
        self.session = session

    # def list(self):
