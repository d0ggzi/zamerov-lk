import enum


class Status(enum.Enum):
    DRAFT = "draft"
    READY = "ready"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
