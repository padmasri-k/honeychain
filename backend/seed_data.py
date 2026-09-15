"""
Seed script to populate the HoneyChain database with realistic demo data.
Run: python seed_data.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from datetime import datetime, timedelta, timezone
import json
import random

from database import SessionLocal, create_tables
from models.user import User, UserRole
from models.hive import Hive, HiveStatus
from models.batch import Batch, BatchStatus, HoneyVariety
from models.supply_chain import SupplyChainEvent, EventType
from services.auth_service import hash_password
from services.blockchain_service import create_genesis_block, add_block
from services.qr_service import generate_qr_code


def seed():
    create_tables()
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("⚠️  Database already has data. Skipping seed.")
            return

        print("🌱 Seeding HoneyChain database...")

        # --- USERS ---
        users = [
            User(
                name="Ramesh Kumar",
                email="ramesh@honeychain.in",
                password_hash=hash_password("password123"),
                role=UserRole.BEEKEEPER,
                organization="Kumar Apiaries",
                location="Jaipur, Rajasthan",
                phone="+91 98765 43210",
            ),
            User(
                name="Sunita Devi",
                email="sunita@honeychain.in",
                password_hash=hash_password("password123"),
                role=UserRole.BEEKEEPER,
                organization="Devi Bee Farm",
                location="Muzaffarpur, Bihar",
                phone="+91 98765 43211",
            ),
            User(
                name="Priya Foods Pvt Ltd",
                email="processor@honeychain.in",
                password_hash=hash_password("password123"),
                role=UserRole.PROCESSOR,
                organization="Priya Honey Processing",
                location="Delhi NCR",
                phone="+91 11 2345 6789",
            ),
            User(
                name="QuickShip Logistics",
                email="distributor@honeychain.in",
                password_hash=hash_password("password123"),
                role=UserRole.DISTRIBUTOR,
                organization="QuickShip Distribution",
                location="Mumbai, Maharashtra",
                phone="+91 22 3456 7890",
            ),
            User(
                name="Nature's Basket Store",
                email="retailer@honeychain.in",
                password_hash=hash_password("password123"),
                role=UserRole.RETAILER,
                organization="Nature's Basket",
                location="Bangalore, Karnataka",
                phone="+91 80 4567 8901",
            ),
            User(
                name="Admin",
                email="admin@honeychain.in",
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN,
                organization="HoneyChain Platform",
                location="New Delhi",
                phone="+91 11 9876 5432",
            ),
        ]
        for u in users:
            db.add(u)
        db.commit()
        for u in users:
            db.refresh(u)
        print(f"  ✅ Created {len(users)} users")

        # --- HIVES ---
        hives_data = [
            # Ramesh's hives (Rajasthan)
            Hive(owner_id=users[0].id, name="Desert Bloom Alpha", location_name="Barmer, Rajasthan",
                 location_lat=25.75, location_lng=71.38, bee_species="Apis cerana indica",
                 flora_source="Sidr (Jujube)", hive_type="Top Bar", colony_strength=45000, status=HiveStatus.ACTIVE),
            Hive(owner_id=users[0].id, name="Desert Bloom Beta", location_name="Jaisalmer, Rajasthan",
                 location_lat=26.91, location_lng=70.91, bee_species="Apis mellifera",
                 flora_source="Mustard", hive_type="Langstroth", colony_strength=55000, status=HiveStatus.ACTIVE),
            Hive(owner_id=users[0].id, name="Thar Oasis Hive", location_name="Jodhpur, Rajasthan",
                 location_lat=26.29, location_lng=73.02, bee_species="Apis cerana indica",
                 flora_source="Acacia", hive_type="Langstroth", colony_strength=38000, status=HiveStatus.HARVESTING),
            Hive(owner_id=users[0].id, name="Aravalli Ridge", location_name="Udaipur, Rajasthan",
                 location_lat=24.58, location_lng=73.68, bee_species="Apis dorsata",
                 flora_source="Eucalyptus", hive_type="Top Bar", colony_strength=60000, status=HiveStatus.ACTIVE),
            # Sunita's hives (Bihar)
            Hive(owner_id=users[1].id, name="Litchi Garden Hive 1", location_name="Muzaffarpur, Bihar",
                 location_lat=26.12, location_lng=85.40, bee_species="Apis mellifera",
                 flora_source="Litchi", hive_type="Langstroth", colony_strength=50000, status=HiveStatus.ACTIVE),
            Hive(owner_id=users[1].id, name="Litchi Garden Hive 2", location_name="Muzaffarpur, Bihar",
                 location_lat=26.12, location_lng=85.41, bee_species="Apis mellifera",
                 flora_source="Litchi", hive_type="Langstroth", colony_strength=48000, status=HiveStatus.ACTIVE),
            Hive(owner_id=users[1].id, name="Sunflower Fields", location_name="Patna, Bihar",
                 location_lat=25.61, location_lng=85.14, bee_species="Apis cerana indica",
                 flora_source="Sunflower", hive_type="Top Bar", colony_strength=35000, status=HiveStatus.ACTIVE),
            Hive(owner_id=users[1].id, name="Wild Forest Hive", location_name="Valmiki Nagar, Bihar",
                 location_lat=27.32, location_lng=83.93, bee_species="Apis dorsata",
                 flora_source="Mixed Wild Flora", hive_type="Log Hive", colony_strength=70000, status=HiveStatus.DORMANT),
        ]
        for h in hives_data:
            db.add(h)
        db.commit()
        for h in hives_data:
            db.refresh(h)
        print(f"  ✅ Created {len(hives_data)} hives")

        # --- BATCHES ---
        now = datetime.now(timezone.utc)
        batches_data = [
            # Ramesh's batches
            {"code": "HC-SIDR2025", "hive": 0, "user": 0, "variety": HoneyVariety.SIDR,
             "date": now - timedelta(days=45), "qty": 25.5, "moisture": 17.2, "color": "Dark Amber",
             "hmf": 15.3, "purity": 96.5, "status": BatchStatus.SOLD},
            {"code": "HC-MUST2025", "hive": 1, "user": 0, "variety": HoneyVariety.MUSTARD,
             "date": now - timedelta(days=30), "qty": 40.0, "moisture": 18.1, "color": "Light Amber",
             "hmf": 12.8, "purity": 94.2, "status": BatchStatus.DELIVERED},
            {"code": "HC-ACAC2025", "hive": 2, "user": 0, "variety": HoneyVariety.ACACIA,
             "date": now - timedelta(days=15), "qty": 18.0, "moisture": 16.8, "color": "Extra Light Amber",
             "hmf": 8.5, "purity": 98.1, "status": BatchStatus.IN_TRANSIT},
            {"code": "HC-EUCL2025", "hive": 3, "user": 0, "variety": HoneyVariety.EUCALYPTUS,
             "date": now - timedelta(days=7), "qty": 32.0, "moisture": 17.5, "color": "Amber",
             "hmf": 10.2, "purity": 95.8, "status": BatchStatus.PROCESSING},
            # Sunita's batches
            {"code": "HC-LTCH2025", "hive": 4, "user": 1, "variety": HoneyVariety.LITCHI,
             "date": now - timedelta(days=60), "qty": 35.0, "moisture": 16.5, "color": "Light Amber",
             "hmf": 9.1, "purity": 97.3, "status": BatchStatus.SOLD},
            {"code": "HC-LTCH2026", "hive": 5, "user": 1, "variety": HoneyVariety.LITCHI,
             "date": now - timedelta(days=20), "qty": 28.0, "moisture": 17.0, "color": "Light Amber",
             "hmf": 11.5, "purity": 95.0, "status": BatchStatus.PACKAGED},
            {"code": "HC-SUNF2025", "hive": 6, "user": 1, "variety": HoneyVariety.SUNFLOWER,
             "date": now - timedelta(days=10), "qty": 15.0, "moisture": 18.5, "color": "Golden",
             "hmf": 7.2, "purity": 93.1, "status": BatchStatus.TESTING},
            {"code": "HC-WILD2025", "hive": 7, "user": 1, "variety": HoneyVariety.WILD,
             "date": now - timedelta(days=90), "qty": 12.0, "moisture": 15.8, "color": "Dark Amber",
             "hmf": 18.9, "purity": 99.2, "status": BatchStatus.SOLD},
        ]

        created_batches = []
        for bd in batches_data:
            batch = Batch(
                batch_code=bd["code"],
                hive_id=hives_data[bd["hive"]].id,
                beekeeper_id=users[bd["user"]].id,
                variety=bd["variety"],
                harvest_date=bd["date"],
                quantity_kg=bd["qty"],
                moisture_pct=bd["moisture"],
                color_grade=bd["color"],
                hmf_level=bd["hmf"],
                purity_score=bd["purity"],
                status=bd["status"],
                current_holder_id=users[bd["user"]].id,
            )
            db.add(batch)
            db.commit()
            db.refresh(batch)
            created_batches.append(batch)

            # Create blockchain
            create_genesis_block(db, batch.id)

            # Add harvest block
            add_block(db, batch.id, {
                "event": "harvested",
                "actor": users[bd["user"]].name,
                "quantity_kg": bd["qty"],
                "hive": hives_data[bd["hive"]].name,
                "location": hives_data[bd["hive"]].location_name,
            })

            # Generate QR code
            try:
                qr_result = generate_qr_code(batch.batch_code)
                batch.qr_code_path = qr_result["filename"]
                db.commit()
            except Exception:
                pass

        print(f"  ✅ Created {len(created_batches)} batches with blockchain")

        # --- SUPPLY CHAIN EVENTS ---
        # Add supply chain events for completed batches
        event_sequences = {
            BatchStatus.SOLD: [
                (EventType.HARVESTED, 0, "Honey harvested from hive"),
                (EventType.LAB_TESTED, 0, "Quality testing at local lab"),
                (EventType.PROCESSED, 2, "Filtered, pasteurized, and graded"),
                (EventType.PACKAGED, 2, "Packed in food-grade jars with labels"),
                (EventType.DISPATCHED, 3, "Dispatched via cold chain logistics"),
                (EventType.RECEIVED, 4, "Received at retail store"),
                (EventType.RETAILED, 4, "Placed on store shelves"),
                (EventType.SOLD, 4, "Sold to consumer"),
            ],
            BatchStatus.DELIVERED: [
                (EventType.HARVESTED, 0, "Honey harvested from hive"),
                (EventType.LAB_TESTED, 0, "Quality testing completed"),
                (EventType.PROCESSED, 2, "Processing and grading done"),
                (EventType.PACKAGED, 2, "Packaging completed"),
                (EventType.DISPATCHED, 3, "In transit to retailer"),
                (EventType.RECEIVED, 4, "Delivered to retailer"),
            ],
            BatchStatus.IN_TRANSIT: [
                (EventType.HARVESTED, 0, "Honey harvested"),
                (EventType.LAB_TESTED, 0, "Lab testing done"),
                (EventType.PROCESSED, 2, "Processed and graded"),
                (EventType.PACKAGED, 2, "Packaged for shipping"),
                (EventType.DISPATCHED, 3, "Dispatched for delivery"),
            ],
            BatchStatus.PROCESSING: [
                (EventType.HARVESTED, 0, "Honey harvested"),
                (EventType.LAB_TESTED, 0, "Quality testing in progress"),
                (EventType.PROCESSED, 2, "Currently processing"),
            ],
            BatchStatus.PACKAGED: [
                (EventType.HARVESTED, 0, "Honey harvested"),
                (EventType.LAB_TESTED, 0, "Quality testing passed"),
                (EventType.PROCESSED, 2, "Processing completed"),
                (EventType.PACKAGED, 2, "Packaged and ready for dispatch"),
            ],
            BatchStatus.TESTING: [
                (EventType.HARVESTED, 0, "Honey harvested"),
                (EventType.LAB_TESTED, 0, "Lab testing in progress"),
            ],
        }

        event_count = 0
        for batch_data, batch in zip(batches_data, created_batches):
            status = batch_data["status"]
            events = event_sequences.get(status, [])

            for i, (event_type, user_idx_offset, desc) in enumerate(events):
                # Determine the actual user index
                base_user_idx = batch_data["user"]
                if user_idx_offset > 0:
                    actual_user_idx = user_idx_offset
                else:
                    actual_user_idx = base_user_idx

                event = SupplyChainEvent(
                    batch_id=batch.id,
                    actor_id=users[actual_user_idx].id,
                    event_type=event_type,
                    description=desc,
                    location=users[actual_user_idx].location,
                    timestamp=batch_data["date"] + timedelta(days=i * 2),
                )
                db.add(event)

                # Add blockchain block
                block = add_block(db, batch.id, {
                    "event": event_type.value,
                    "actor": users[actual_user_idx].name,
                    "description": desc,
                    "location": users[actual_user_idx].location,
                })
                event.block_hash = block.hash
                event_count += 1

        db.commit()
        print(f"  ✅ Created {event_count} supply chain events")

        print("\n=== Seed complete! Demo accounts: ===")
        print("  Beekeeper:   ramesh@apiary.in (or ramesh@honeychain.in) / password123")
        print("  Beekeeper:   sunita@honeychain.in / password123")
        print("  Processor:   processor@honeychain.in / password123")
        print("  Distributor: distributor@honeychain.in / password123")
        print("  Retailer:    retailer@honeychain.in / password123")
        print("  Admin:       admin@honeychain.in / admin123")

    except Exception as e:
        print(f"[ERROR] Error seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
