class UserAlreadyExistsError(Exception):
    """Пользователь уже существует"""


class UserNotFoundError(Exception):
    """Пользователь уже существует"""


class RoleNotFoundError(Exception):
    """Роль не найдена"""


class BadCredentials(Exception):
    """Неверные данные для входа"""


class RequestNotFoundError(Exception):
    """Заявка не найдена"""


class OrderNotFoundError(Exception):
    """Заказ не найден"""


class ServiceNotFoundError(Exception):
    """Услуга не найдена"""
