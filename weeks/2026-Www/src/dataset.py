from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple
import random

Sample = Tuple[str, str]


SAMPLE_DATA: List[Sample] = [
    ("sports", "The team won the championship after a close final"),
    ("sports", "A thrilling overtime victory sealed the series"),
    ("sports", "The striker scored a hat trick in the derby"),
    ("sports", "The coach emphasized defense and conditioning"),
    ("sports", "A record-breaking sprint won gold"),
    ("sports", "The rookie set a new league record"),
    ("sports", "Training camp focused on endurance and footwork"),
    ("sports", "Fans celebrated the comeback win"),
    ("tech", "The new framework improves build performance"),
    ("tech", "Security patches shipped for the server runtime"),
    ("tech", "The database added vector search indexes"),
    ("tech", "GPU acceleration boosted training throughput"),
    ("tech", "A compiler update improved error messages"),
    ("tech", "The API gateway reduced latency for requests"),
    ("tech", "Rust adoption improved memory safety in services"),
    ("tech", "The CI pipeline now runs faster"),
    ("health", "Daily walks support heart health"),
    ("health", "Nutrition studies highlight protein balance"),
    ("health", "Sleep consistency improves recovery"),
    ("health", "Hydration reduces fatigue during workouts"),
    ("health", "Mindfulness lowers stress levels"),
    ("health", "Stretching improves mobility after workouts"),
    ("health", "Meditation helps manage anxiety"),
    ("health", "Balanced meals support steady energy"),
]


@dataclass
class DatasetSplit:
    train: List[Sample]
    test: List[Sample]


def load_sample_dataset(seed: int = 42, test_ratio: float = 0.3) -> DatasetSplit:
    data = SAMPLE_DATA[:]
    random.Random(seed).shuffle(data)
    split_idx = max(1, int(len(data) * (1 - test_ratio)))
    return DatasetSplit(train=data[:split_idx], test=data[split_idx:])
