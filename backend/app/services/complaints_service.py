from app.domain import ALLOWED_TRANSITIONS, InvalidTransitionError, Status


def validate_status_transition(current_status: Status, new_status: Status) -> None:
    """Validates if transitioning from current_status to new_status is allowed.

    Raises InvalidTransitionError if transition is not in ALLOWED_TRANSITIONS table.
    """
    if current_status == new_status:
        return

    allowed_targets = ALLOWED_TRANSITIONS.get(current_status, set())
    if new_status not in allowed_targets:
        raise InvalidTransitionError(current_status=current_status, new_status=new_status)
