from app.domain import Category, Priority
from app.providers.triage.base import TriageResult
from app.providers.triage.rules import RuleBasedTriage


class SimulatedTriage:
    name: str = "simulated"

    def __init__(self, should_fail: bool = False):
        self.should_fail = should_fail
        self._fallback_rules = RuleBasedTriage()

    async def triage(self, text: str, location: str) -> TriageResult:
        if self.should_fail:
            raise RuntimeError("Simulated failure in SimulatedTriage provider")

        # Reuse rules logic to generate realistic deterministic output for CI testing
        result = await self._fallback_rules.triage(text, location)
        return TriageResult(
            category=result.category,
            priority=result.priority,
            summary=result.summary,
            confidence=0.95,
        )
