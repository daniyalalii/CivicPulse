import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone

# Add parent directory to sys.path to allow imports from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select

from app.config import settings
from app.domain import Category, Priority, Status
from app.repositories.models import Complaint

SEED_DATA = [
    {
        "text": "Water main line burst near G-9 markaz masjid since fajr time. Water entering ground floor houses, total zalalat!",
        "location": "Sector G-9 Markaz, Islamabad",
        "category": Category.WATER,
        "priority": Priority.HIGH,
        "summary": "Burst water main flooding ground floor houses in G-9 Markaz",
    },
    {
        "text": "Transformer spark in Sector F-10/2 after short circuit. Electricity band hai for 6 hours now, kindly fix asap bhai.",
        "location": "Street 12, F-10/2, Islamabad",
        "category": Category.ELECTRICITY,
        "priority": Priority.HIGH,
        "summary": "Transformer spark caused 6-hour power outage in F-10/2",
    },
    {
        "text": "Kutray and kachra heap overflowing near Model Town main gate. Badboo is unbearable for past three days.",
        "location": "Main Gate, Model Town, Lahore",
        "category": Category.SANITATION,
        "priority": Priority.NORMAL,
        "summary": "Overflowing garbage heap causing foul odor at Model Town gate",
    },
    {
        "text": "Huge pothole on Main Boulevard Gulberg near Liberty chowk. Two bikes slipped yesterday night, very dangerous Khuda ke vaste repair it.",
        "location": "Main Boulevard, Gulberg, Lahore",
        "category": Category.ROADS,
        "priority": Priority.HIGH,
        "summary": "Hazardous pothole near Liberty Chowk causing motor accidents",
    },
    {
        "text": "Streetlights on Street 14 Sector I-8/3 are off for 2 weeks. Bohot andhera hota hai at night, safety issue for women.",
        "location": "Street 14, I-8/3, Islamabad",
        "category": Category.STREETLIGHTS,
        "priority": Priority.NORMAL,
        "summary": "Non-functioning streetlights for 2 weeks on Street 14, I-8/3",
    },
    {
        "text": "Sewer lines blocked near Block C DHA Phase 5, dirty gutteer water overflow on main street.",
        "location": "Block C, DHA Phase 5, Lahore",
        "category": Category.SANITATION,
        "priority": Priority.HIGH,
        "summary": "Blocked sewer causing sewage overflow in DHA Phase 5 Block C",
    },
    {
        "text": "Low voltage issue in Block 4 Clifton since yesterday evening. AC and fridge not working properly.",
        "location": "Block 4, Clifton, Karachi",
        "category": Category.ELECTRICITY,
        "priority": Priority.LOW,
        "summary": "Severe low voltage in Clifton Block 4 affecting home appliances",
    },
    {
        "text": "Water supply is coming mixed with mud and smell in Sector G-11/4. Unfit for drinking or cooking.",
        "location": "Sector G-11/4, Islamabad",
        "category": Category.WATER,
        "priority": Priority.HIGH,
        "summary": "Contaminated muddy water supply in Sector G-11/4",
    },
    {
        "text": "Open manhole cover near Primary School in Nazimabad Block 3. Any child can fall into it, urgent attention needed!",
        "location": "Nazimabad Block 3, Karachi",
        "category": Category.SANITATION,
        "priority": Priority.HIGH,
        "summary": "Open manhole hazard near Primary School in Nazimabad",
    },
    {
        "text": "Speed breaker broken and sharp iron rods exposed near Commercial Area Johar Town.",
        "location": "Commercial Area, Johar Town, Lahore",
        "category": Category.ROADS,
        "priority": Priority.NORMAL,
        "summary": "Damaged speed breaker with exposed iron rods in Johar Town",
    },
    {
        "text": "No water supply for 4 days in Sector F-7/1 street 9. Tanker walay are charging double rate.",
        "location": "Street 9, F-7/1, Islamabad",
        "category": Category.WATER,
        "priority": Priority.HIGH,
        "summary": "4-day total water supply disruption in F-7/1 Street 9",
    },
    {
        "text": "Feeder trip again and again in Satellite Town Block B. Load shedding schedule is not followed.",
        "location": "Block B, Satellite Town, Rawalpindi",
        "category": Category.ELECTRICITY,
        "priority": Priority.NORMAL,
        "summary": "Frequent feeder tripping in Satellite Town Block B",
    },
    {
        "text": "Garbage collector vehicle has not come to G-10/2 street 45 for whole week. Smelling terrible.",
        "location": "Street 45, G-10/2, Islamabad",
        "category": Category.SANITATION,
        "priority": Priority.NORMAL,
        "summary": "Uncollected domestic garbage for one week in G-10/2",
    },
    {
        "text": "Streetlight pole bent and hanging dangerously after storm on Murree Road near Faizabad.",
        "location": "Murree Road near Faizabad, Rawalpindi",
        "category": Category.STREETLIGHTS,
        "priority": Priority.HIGH,
        "summary": "Hazardous leaning streetlight pole on main Murree Road",
    },
    {
        "text": "Road carpet damaged due to illegal pipeline digging near Saddar Bazar main road.",
        "location": "Saddar Bazar Main Road, Rawalpindi",
        "category": Category.ROADS,
        "priority": Priority.LOW,
        "summary": "Road surface damaged by unauthorized trench digging in Saddar",
    },
    {
        "text": "Water leakage from main valve near Sector H-9 Sunday Bazar entrance. Thousands of gallons wasting.",
        "location": "Sunday Bazar Entrance, H-9, Islamabad",
        "category": Category.WATER,
        "priority": Priority.NORMAL,
        "summary": "Major valve leakage losing potable water near H-9 Sunday Bazar",
    },
    {
        "text": "Electric wire hanging low near street 22 G-6/1. Risk of electric shock to passersby.",
        "location": "Street 22, G-6/1, Islamabad",
        "category": Category.ELECTRICITY,
        "priority": Priority.HIGH,
        "summary": "Low-hanging power lines posing electrocution risk in G-6/1",
    },
    {
        "text": "Construction debris dumped illegally on green belt near Sector F-8/4 main park.",
        "location": "Main Park, F-8/4, Islamabad",
        "category": Category.OTHER,
        "priority": Priority.LOW,
        "summary": "Illegal dumping of construction waste on green belt in F-8/4",
    },
    {
        "text": "Broken pavement tiles causing stumbling hazard for senior citizens in Cantt Board park.",
        "location": "Cantt Board Park, Multan",
        "category": Category.ROADS,
        "priority": Priority.LOW,
        "summary": "Broken pedestrian tiles in Cantt Park posing tripping hazard",
    },
    {
        "text": "Streetlights flickering continuously all night in Sector E-11/3 near double road.",
        "location": "Double Road, E-11/3, Islamabad",
        "category": Category.STREETLIGHTS,
        "priority": Priority.LOW,
        "summary": "Flickering streetlights along E-11/3 double road",
    },
    {
        "text": "Drainage ditch clogged with plastic bags in Raja Bazar. Rainwater standing on street.",
        "location": "Raja Bazar, Rawalpindi",
        "category": Category.SANITATION,
        "priority": Priority.NORMAL,
        "summary": "Clogged storm drain causing street waterlogging in Raja Bazar",
    },
    {
        "text": "Water pressure extremely low on upper floors in Sector G-7/2 streets 12-15.",
        "location": "Streets 12-15, G-7/2, Islamabad",
        "category": Category.WATER,
        "priority": Priority.LOW,
        "summary": "Low water pressure on upper floors in Sector G-7/2",
    },
    {
        "text": "Old tree branch touching high voltage electricity lines near Sector F-6/2 street 3.",
        "location": "Street 3, F-6/2, Islamabad",
        "category": Category.ELECTRICITY,
        "priority": Priority.NORMAL,
        "summary": "Tree branches contacting high voltage lines in F-6/2",
    },
    {
        "text": "Stray dogs pack disturbing residents near Block 5 Gulshan-e-Iqbal at night.",
        "location": "Block 5, Gulshan-e-Iqbal, Karachi",
        "category": Category.OTHER,
        "priority": Priority.NORMAL,
        "summary": "Stray dog pack nuisance in Gulshan-e-Iqbal Block 5",
    },
    {
        "text": "Illegal encroachment and fruit carts blocking road near Tariq Road junction.",
        "location": "Tariq Road Junction, Karachi",
        "category": Category.OTHER,
        "priority": Priority.NORMAL,
        "summary": "Road obstruction by unauthorized commercial carts on Tariq Road",
    },
    {
        "text": "Water pipeline leaking underground causing road cave-in near Sector I-10/1 main road.",
        "location": "Main Road, I-10/1, Islamabad",
        "category": Category.WATER,
        "priority": Priority.HIGH,
        "summary": "Subsurface pipe leak causing road collapse in I-10/1",
    },
    {
        "text": "Transformer oil leaking continuously near Street 5 Sector G-8/1.",
        "location": "Street 5, G-8/1, Islamabad",
        "category": Category.ELECTRICITY,
        "priority": Priority.HIGH,
        "summary": "Continuous transformer oil leak in Sector G-8/1",
    },
    {
        "text": "Dead animal lying on roadside near Airport Road for 2 days. Very bad smell.",
        "location": "Airport Road, Lahore",
        "category": Category.SANITATION,
        "priority": Priority.HIGH,
        "summary": "Unremoved animal carcass causing health hazard on Airport Road",
    },
    {
        "text": "Timer for streetlights is wrong in Sector F-11/1, lights remain ON during day and OFF at night.",
        "location": "Sector F-11/1, Islamabad",
        "category": Category.STREETLIGHTS,
        "priority": Priority.LOW,
        "summary": "Misconfigured lighting timer in Sector F-11/1",
    },
    {
        "text": "Huge water puddle accumulated in front of Federal Government School in Sector G-9/1.",
        "location": "FG School, G-9/1, Islamabad",
        "category": Category.ROADS,
        "priority": Priority.NORMAL,
        "summary": "Standing water pool blocking entrance to FG School G-9/1",
    },
]


async def seed() -> None:
    engine = create_async_engine(settings.database_url)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        inserted_count = 0
        skipped_count = 0

        for item in SEED_DATA:
            # Deterministic UUID based on complaint text
            complaint_id = uuid.uuid5(uuid.NAMESPACE_DNS, item["text"])

            # Check if exists
            existing = await session.get(Complaint, complaint_id)
            if existing:
                skipped_count += 1
                continue

            now = datetime.now(timezone.utc)
            complaint = Complaint(
                id=complaint_id,
                text=item["text"],
                location=item["location"],
                reporter_contact="0300-1234567",
                category=item["category"],
                priority=item["priority"],
                status=Status.OPEN,
                ai_summary=item["summary"],
                triaged_by="rules",
                triage_latency_ms=12,
                created_at=now,
                updated_at=now,
            )
            session.add(complaint)
            inserted_count += 1

        await session.commit()
        print(f"Seeding completed. Inserted: {inserted_count}, Skipped (already exist): {skipped_count}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
