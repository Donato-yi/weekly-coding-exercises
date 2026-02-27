from __future__ import annotations

from pathlib import Path
from typing import Tuple


def check_snapshot(content: str, snapshot_path: Path, update: bool = False) -> Tuple[bool, str]:
    if update or not snapshot_path.exists():
        snapshot_path.write_text(content, encoding="utf-8")
        return True, "snapshot updated"

    expected = snapshot_path.read_text(encoding="utf-8")
    if expected == content:
        return True, "snapshot match"
    return False, "snapshot mismatch"
