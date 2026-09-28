import pytest

from app.domain import InvalidTransitionError, Status
from app.services.complaints_service import validate_status_transition


def test_allowed_transitions():
    # Valid transitions
    validate_status_transition(Status.OPEN, Status.IN_PROGRESS)
    validate_status_transition(Status.OPEN, Status.REJECTED)
    validate_status_transition(Status.IN_PROGRESS, Status.RESOLVED)
    validate_status_transition(Status.IN_PROGRESS, Status.REJECTED)
    validate_status_transition(Status.OPEN, Status.OPEN)
    validate_status_transition(Status.RESOLVED, Status.RESOLVED)


def test_invalid_transitions():
    # Terminal state transitions must raise InvalidTransitionError
    with pytest.raises(InvalidTransitionError):
        validate_status_transition(Status.RESOLVED, Status.OPEN)

    with pytest.raises(InvalidTransitionError):
        validate_status_transition(Status.RESOLVED, Status.IN_PROGRESS)

    with pytest.raises(InvalidTransitionError):
        validate_status_transition(Status.REJECTED, Status.OPEN)

    with pytest.raises(InvalidTransitionError):
        validate_status_transition(Status.REJECTED, Status.IN_PROGRESS)
