from typing import Optional

from app.config import settings
from app.providers.triage.base import TriageProvider
from app.providers.triage.llm import LLMTriage
from app.providers.triage.rules import RuleBasedTriage
from app.providers.triage.simulated import SimulatedTriage


def get_triage_provider(provider_name: Optional[str] = None) -> TriageProvider:
    name = provider_name or settings.triage_provider

    if name == "llm:groq" or name == "llm":
        return LLMTriage()
    elif name == "simulated":
        return SimulatedTriage()
    elif name == "rules":
        return RuleBasedTriage()
    else:
        # Default fallback
        return SimulatedTriage()
