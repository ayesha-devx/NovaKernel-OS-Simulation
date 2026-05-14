from dataclasses import dataclass, field
from typing import Dict, List, Any
import time

@dataclass
class MetricSnapshot:
    timestamp: float = field(default_factory=time.time)
    cpu: Dict[str, Any] = field(default_factory=dict)
    memory: Dict[str, Any] = field(default_factory=dict)
    disk: Dict[str, Any] = field(default_factory=dict)
    scheduler: Dict[str, Any] = field(default_factory=dict)
    hardware: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TimelineEvent:
    id: str
    timestamp: float
    module: str
    event: str
    severity: str
    message: str
    pid: int = None
    metadata: Dict[str, Any] = field(default_factory=dict)
