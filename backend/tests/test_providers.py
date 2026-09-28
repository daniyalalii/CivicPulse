import pytest
from unittest.mock import AsyncMock, patch

from app.domain import Category, Priority
from app.providers.triage.factory import get_triage_provider
from app.providers.triage.llm import LLMTriage
from app.providers.triage.rules import RuleBasedTriage
from app.providers.triage.simulated import SimulatedTriage


@pytest.mark.asyncio
async def test_simulated_triage_success():
    provider = SimulatedTriage(should_fail=False)
    res = await provider.triage("Transformer spark and power outage", "F-10/2")
    assert res.category == Category.ELECTRICITY
    assert res.confidence == 0.95


@pytest.mark.asyncio
async def test_rule_based_triage_categories():
    provider = RuleBasedTriage()

    res_elec = await provider.triage("Transformer spark and voltage problem", "Loc")
    assert res_elec.category == Category.ELECTRICITY

    res_san = await provider.triage("Kachra and badboo in garbage area", "Loc")
    assert res_san.category == Category.SANITATION

    res_road = await provider.triage("Pothole on main street road", "Loc")
    assert res_road.category == Category.ROADS

    res_light = await provider.triage("Dark streetlight bulb off", "Loc")
    assert res_light.category == Category.STREETLIGHTS

    res_other = await provider.triage("Stray dogs noise at night", "Loc")
    assert res_other.category == Category.OTHER

    res_low = await provider.triage("Minor flicker on streetlight timer", "Loc")
    assert res_low.priority == Priority.LOW


def test_provider_factory():
    p_llm = get_triage_provider("llm")
    assert isinstance(p_llm, LLMTriage)

    p_sim = get_triage_provider("simulated")
    assert isinstance(p_sim, SimulatedTriage)

    p_rules = get_triage_provider("rules")
    assert isinstance(p_rules, RuleBasedTriage)

    p_def = get_triage_provider("unknown_provider")
    assert isinstance(p_def, SimulatedTriage)


@pytest.mark.asyncio
async def test_llm_triage_missing_key():
    provider = LLMTriage(api_key="")
    with pytest.raises(ValueError, match="GROQ API key is missing"):
        await provider.triage("Test text", "Test location")


@pytest.mark.asyncio
async def test_llm_triage_mocked_success():
    provider = LLMTriage(api_key="fake_key", model="llama-3.1-8b-instant")
    mock_response = AsyncMock()
    mock_choice = AsyncMock()
    mock_choice.message.content = '{"category": "water", "priority": "high", "summary": "Water pipe leak", "confidence": 0.99}'
    mock_response.choices = [mock_choice]

    with patch.object(provider.client.chat.completions, "create", return_value=mock_response):
        res = await provider.triage("Water pipe leaking in street 5", "Sector G-9")
        assert res.category == Category.WATER
        assert res.priority == Priority.HIGH
        assert res.summary == "Water pipe leak"
