from app.shared.exceptions import AppError


class InvalidCredentialsError(AppError):
    status_code = 401
    code = "invalid_credentials"


class AccountDisabledError(AppError):
    status_code = 403
    code = "account_disabled"


class UserExistsError(AppError):
    status_code = 409
    code = "user_exists"


class UserNotFoundError(AppError):
    status_code = 404
    code = "user_not_found"
