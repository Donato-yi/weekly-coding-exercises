from __future__ import annotations

import argparse
import json
import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from topology import load_services_from_file


def main() -> int:
    parser = argparse.ArgumentParser(description="Review a service topology for architecture risks.")
    parser.add_argument("topology", help="Path to a JSON topology file")
    parser.add_argument("--focus", help="Service name to analyze for blast radius")
    args = parser.parse_args()

    graph = load_services_from_file(args.topology)
    summary = graph.review_summary(focus=args.focus)
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
