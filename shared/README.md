# OppForge Shared

Shared constants, types, and configurations used across all OppForge services (backend, ai-engine, frontend).

## Contents

| File | Description |
|------|-------------|
| `constants.py` | App-wide constants (categories, statuses, scoring weights) |
| `chains.py` | Blockchain chain configurations (names, RPCs, icons) |
| `categories.py` | Opportunity category definitions |
| `types.py` | Shared type definitions and enums |

## Usage

```python
from shared.constants import OPPORTUNITY_CATEGORIES
from shared.chains import SUPPORTED_CHAINS
from shared.categories import CATEGORY_LABELS
```
