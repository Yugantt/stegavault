from app.shared.exceptions import AppError


class StegoError(AppError):
    code = "stego_error"


class CapacityExceededError(StegoError):
    status_code = 413
    code = "capacity_exceeded"


class NoHiddenDataError(StegoError):
    status_code = 404
    code = "no_hidden_data"


class PasswordRequiredError(StegoError):
    status_code = 401
    code = "password_required"


class CorruptedPayloadError(StegoError):
    status_code = 422
    code = "corrupted_payload"
