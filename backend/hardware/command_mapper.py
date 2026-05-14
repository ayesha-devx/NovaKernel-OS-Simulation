class CommandMapper:
    """
    Protocol definition for NovaKernel -> Arduino serial communication.
    Maps high-level OS states to specific byte sequences/strings.
    """
    
    # State Mapping
    STATE_MAP = {
        "READY": "READY",
        "RUNNING": "RUNNING",
        "WAITING": "WAIT",
        "TERMINATED": "DONE"
    }

    @staticmethod
    def get_command(slot, state):
        """
        Generates protocol command for a specific slot and state.
        Example: slot 1, RUNNING -> P1_RUNNING
        """
        if slot < 1 or slot > 3:
            return None
        
        protocol_state = CommandMapper.STATE_MAP.get(state)
        if not protocol_state:
            return None
            
        return f"P{slot}_{protocol_state}"

    # Global System Commands
    DEADLOCK = "DEADLOCK"
    DISK_ACTIVE = "DISK_ACTIVE"
    RESET_ALL = "RESET_ALL"
    DEMO = "DEMO"

    @staticmethod
    def validate(command):
        """Validates if a command string is part of the official protocol."""
        valid_prefixes = ["P1_", "P2_", "P3_"]
        valid_suffixes = list(CommandMapper.STATE_MAP.values())
        
        # Check Slot Commands
        for p in valid_prefixes:
            for s in valid_suffixes:
                if command == p + s:
                    return True
        
        # Check Global Commands
        if command in [CommandMapper.DEADLOCK, CommandMapper.RESET_ALL, CommandMapper.DEMO]:
            return True
            
        return False

command_mapper = CommandMapper()
