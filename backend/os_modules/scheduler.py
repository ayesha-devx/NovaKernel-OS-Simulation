# Scheduler Placeholder
class Scheduler:
    def __init__(self):
        self.algorithm = "Round Robin"

    def get_status(self):
        return {"status": "Scheduler Active", "algorithm": self.algorithm}
