from app.domain import Category, Priority
from app.providers.triage.base import TriageResult


class RuleBasedTriage:
    name: str = "rules"

    async def triage(self, text: str, location: str) -> TriageResult:
        lower_text = text.lower()

        # Category determination
        if any(k in lower_text for k in ["water", "leak", "pipe", "flooding", "drain", "tap", "tanker"]):
            category = Category.WATER
        elif any(k in lower_text for k in ["electricity", "voltage", "transformer", "power", "feeder", "wire", "spark"]):
            category = Category.ELECTRICITY
        elif any(k in lower_text for k in ["kachra", "garbage", "sanitation", "sewer", "manhole", "badboo", "waste", "clean"]):
            category = Category.SANITATION
        elif any(k in lower_text for k in ["pothole", "road", "pavement", "street", "traffic", "speed breaker"]):
            category = Category.ROADS
        elif any(k in lower_text for k in ["streetlight", "light", "dark", "bulb"]):
            category = Category.STREETLIGHTS
        else:
            category = Category.OTHER

        # Priority determination
        high_keywords = ["burst", "emergency", "spark", "shock", "fire", "flood", "danger", "urgent", "open manhole", "hazard"]
        low_keywords = ["minor", "slow", "low voltage", "flicker", "timer", "pavement"]

        if any(k in lower_text for k in high_keywords):
            priority = Priority.HIGH
        elif any(k in lower_text for k in low_keywords):
            priority = Priority.LOW
        else:
            priority = Priority.NORMAL

        summary = text[:137] + "..." if len(text) > 140 else text

        return TriageResult(
            category=category,
            priority=priority,
            summary=summary,
            confidence=0.8,
        )
