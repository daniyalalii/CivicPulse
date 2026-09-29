"""Seed realistic municipal complaints.

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-29

"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

SEED_ITEMS = [
    ("Water main line burst near G-9 Markaz masjid, water entering many homes.", "Sector G-9 Markaz, Islamabad", "0300-1001001", "water", "high", "Burst water main flooding ground-floor homes in G-9 Markaz"),
    ("Transformer sparked in F-10/2 after a short circuit, power off for hours.", "Street 12, F-10/2, Islamabad", "0300-1001002", "electricity", "high", "Transformer spark caused outage in F-10/2"),
    ("Garbage heap overflowing near Model Town gate, foul smell across the lane.", "Main Gate, Model Town, Lahore", "0300-1001003", "sanitation", "normal", "Overflowing garbage at Model Town gate"),
    ("Huge pothole on Main Boulevard near Liberty Chowk, bikes nearly fell in it.", "Main Boulevard, Gulberg, Lahore", "0300-1001004", "roads", "high", "Large pothole near Liberty Chowk"),
    ("Streetlights on Street 14 I-8/3 are off for more than two weeks.", "Street 14, I-8/3, Islamabad", "0300-1001005", "streetlights", "normal", "Streetlights off for two weeks"),
    ("Sewer pipe blocked near DHA Phase 5, dirty water flowing onto the street.", "Block C, DHA Phase 5, Lahore", "0300-1001006", "sanitation", "high", "Blocked sewer causing overflow"),
    ("Low voltage in Block 4 Clifton, fridge and AC not working properly.", "Block 4, Clifton, Karachi", "0300-1001007", "electricity", "low", "Low voltage affecting appliances"),
    ("Mud mixed with drinking water in G-11/4, smell very bad and unfit to consume.", "Sector G-11/4, Islamabad", "0300-1001008", "water", "high", "Muddy water supply in G-11/4"),
    ("Open manhole next to primary school in Nazimabad, very dangerous for kids.", "Nazimabad Block 3, Karachi", "0300-1001009", "sanitation", "high", "Open manhole near school"),
    ("Speed breaker broken and rusty iron rods exposed near Johar Town market.", "Commercial Area, Johar Town, Lahore", "0300-1001010", "roads", "normal", "Broken speed breaker with exposed rods"),
    ("No water supply for four days in F-7/1, tanker wallahs charging extra.", "Street 9, F-7/1, Islamabad", "0300-1001011", "water", "high", "Four-day water outage in F-7/1"),
    ("Feeder trips repeatedly in Satellite Town, loadshedding schedule is ignored.", "Block B, Satellite Town, Rawalpindi", "0300-1001012", "electricity", "normal", "Frequent feeder tripping"),
    ("Garbage truck did not come to G-10/2 and the lane smells terrible.", "Street 45, G-10/2, Islamabad", "0300-1001013", "sanitation", "normal", "Garbage not collected for a week"),
    ("Streetlight pole is bent and hanging dangerously after the storm.", "Murree Road near Faizabad, Rawalpindi", "0300-1001014", "streetlights", "high", "Leaning streetlight pole on main road"),
    ("Road surface damaged by illegal trenching in Saddar Bazar, very rough.", "Saddar Bazar Main Road, Rawalpindi", "0300-1001015", "roads", "low", "Damaged road due to trenching"),
    ("Water valve leaking near Sunday Bazar H-9, thousands of gallons wasted.", "Sunday Bazar Entrance, H-9, Islamabad", "0300-1001016", "water", "normal", "Major valve leak near H-9 bazar"),
    ("Low-hanging electric wire near G-6/1; risk of shock to pedestrians.", "Street 22, G-6/1, Islamabad", "0300-1001017", "electricity", "high", "Hanging live wire in G-6/1"),
    ("Construction debris dumped on green belt near F-8/4 park, illegal dumping.", "Main Park, F-8/4, Islamabad", "0300-1001018", "other", "low", "Illegal debris dumped on green belt"),
    ("Broken pavement tiles in Cantt Board Park are making it hard for elders to walk.", "Cantt Board Park, Multan", "0300-1001019", "roads", "low", "Broken pavement tiles causing trip risk"),
    ("Streetlights flicker all night on E-11/3 Double Road, very poor visibility.", "Double Road, E-11/3, Islamabad", "0300-1001020", "streetlights", "low", "Flickering streetlights in E-11/3"),
    ("Drainage choked with plastics in Raja Bazar, rainwater standing on road.", "Raja Bazar, Rawalpindi", "0300-1001021", "sanitation", "normal", "Blocked drain causing waterlogging"),
    ("Water pressure is extremely low on upper floors in G-7/2, no supply for homes.", "Streets 12-15, G-7/2, Islamabad", "0300-1001022", "water", "low", "Weak water pressure on upper floors"),
    ("Tree branch touching power lines in F-6/2, danger for nearby residents.", "Street 3, F-6/2, Islamabad", "0300-1001023", "electricity", "normal", "Tree branch touching power lines"),
    ("Stray dogs are troubling residents in Gulshan-e-Iqbal at night.", "Block 5, Gulshan-e-Iqbal, Karachi", "0300-1001024", "other", "normal", "Stray dog nuisance in Gulshan-e-Iqbal"),
    ("Fruit carts and encroachment are blocking traffic at Tariq Road junction.", "Tariq Road Junction, Karachi", "0300-1001025", "other", "normal", "Road obstruction by encroachment"),
    ("Underground water leak is causing road cave-in on Main Road I-10/1.", "Main Road, I-10/1, Islamabad", "0300-1001026", "water", "high", "Road cave-in caused by pipe leak"),
    ("Transformer oil is leaking near G-8/1, strong smell and risk of fire.", "Street 5, G-8/1, Islamabad", "0300-1001027", "electricity", "high", "Transformer oil leak in G-8/1"),
    ("Dead animal on Airport Road has not been removed for two days.", "Airport Road, Lahore", "0300-1001028", "sanitation", "high", "Carcass left on roadside"),
    ("Lighting timer in F-11/1 is wrong, lights stay on by day and off at night.", "Sector F-11/1, Islamabad", "0300-1001029", "streetlights", "low", "Misconfigured streetlight timer"),
    ("Water pooling in front of a school in G-9/1 making the road unsafe.", "FG School, G-9/1, Islamabad", "0300-1001030", "roads", "normal", "Standing water pooling near school"),
    ("Sewage is backing up near Gulshan Ravi, residents cannot use the lane.", "Gulshan Ravi, Lahore", "0300-1001031", "sanitation", "high", "Sewage backup in Gulshan Ravi"),
    ("Streetlight is out near Samanabad and area remains poorly lit at night.", "Samanabad, Lahore", "0300-1001032", "streetlights", "normal", "Streetlight outage in Samanabad"),
]


def upgrade() -> None:
    bind = op.get_bind()
    table = sa.table(
        "complaints",
        sa.column("id", sa.dialects.postgresql.UUID(as_uuid=True)),
        sa.column("text", sa.Text()),
        sa.column("location", sa.String()),
        sa.column("reporter_contact", sa.String()),
        sa.column("category", sa.String()),
        sa.column("priority", sa.String()),
        sa.column("status", sa.String()),
        sa.column("ai_summary", sa.String()),
        sa.column("triaged_by", sa.String()),
        sa.column("triage_latency_ms", sa.Integer()),
        sa.column("created_at", sa.DateTime(timezone=True)),
        sa.column("updated_at", sa.DateTime(timezone=True)),
    )

    for text, location, reporter_contact, category, priority, summary in SEED_ITEMS:
        complaint_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, text))
        now = datetime.now(UTC)
        bind.execute(
            sa.text(
                """
                INSERT INTO complaints (
                    id, text, location, reporter_contact, category, priority, status,
                    ai_summary, triaged_by, triage_latency_ms, created_at, updated_at
                )
                VALUES (
                    :id, :text, :location, :reporter_contact, :category, :priority,
                    :status, :ai_summary, :triaged_by, :triage_latency_ms, :created_at, :updated_at
                )
                ON CONFLICT (id) DO NOTHING
                """
            ),
            {
                "id": complaint_id,
                "text": text,
                "location": location,
                "reporter_contact": reporter_contact,
                "category": category,
                "priority": priority,
                "status": "open",
                "ai_summary": summary,
                "triaged_by": "rules",
                "triage_latency_ms": 12,
                "created_at": now,
                "updated_at": now,
            },
        )


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(sa.text("DELETE FROM complaints WHERE triaged_by = 'rules' AND triage_latency_ms = 12"))
