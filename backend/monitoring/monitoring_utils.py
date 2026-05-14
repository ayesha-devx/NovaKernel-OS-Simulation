import time

def capped_append(target_list, value, max_size=100):
    """Safely append to a rolling buffer, maintaining a max size."""
    if not isinstance(target_list, list):
        return
    target_list.append(value)
    if len(target_list) > max_size:
        # Avoid slicing which creates new lists; pop(0) is O(N) but fine for N=100
        target_list.pop(0)

def safe_average(target_list):
    """Calculate average of a numeric list safely."""
    if not target_list or len(target_list) == 0:
        return 0.0
    return sum(target_list) / len(target_list)

def safe_timestamp():
    """Return a safe milliseconds timestamp."""
    return int(time.time() * 1000)

def format_severity(score):
    """Format a health score into a severity string."""
    if score >= 95:
        return "HEALTHY"
    elif score >= 75:
        return "STABLE"
    elif score >= 50:
        return "DEGRADED"
    else:
        return "CRITICAL"

class Throttler:
    """Helper to throttle updates/emits."""
    def __init__(self, max_per_sec):
        self.min_interval = 1.0 / max_per_sec if max_per_sec > 0 else 0
        self.last_time = 0

    def should_allow(self):
        now = time.time()
        if now - self.last_time >= self.min_interval:
            self.last_time = now
            return True
        return False
