# RosCard Architecture

Home Assistant → State Engine
RosCard → Interaction Layer
Astrion Remote → Hardware Interface

---

## Data Flow

HA Entity State
        ↓
RosCard Card Logic
        ↓
Astrion Rendering Engine
        ↓
User Interaction
        ↓
HA Service Call
