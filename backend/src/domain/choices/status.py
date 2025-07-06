import enum


class RequestStatus(enum.Enum):
    DRAFT = "draft"
    READY = "ready"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
