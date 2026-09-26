class ComplaintNotFound(Exception):
    """Raised when a requested complaint is not found."""

    def __init__(self, complaint_id: str):
        self.complaint_id = complaint_id
        super().__init__(f"Complaint with ID '{complaint_id}' not found.")


class RateLimited(Exception):
    """Raised when request limit is exceeded."""

    def __init__(self, retry_after: int = 60):
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded. Try again in {retry_after} seconds.")
