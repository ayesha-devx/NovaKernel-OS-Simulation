from kernel.socket_bus import socket_bus

class HardwareLogger:
    @staticmethod
    def log(message, severity="INFO", metadata=None):
        """Standardized hardware event logging."""
        print(f"[HARDWARE] {severity}: {message}")
        socket_bus.emit(
            module="HARDWARE_HAL",
            event_type="HAL_LOG",
            message=message,
            severity=severity,
            metadata=metadata
        )

    @staticmethod
    def command_sent(command, mode="SIMULATION"):
        HardwareLogger.log(f"Command Sent: {command} ({mode} mode)", "SUCCESS", {"command": command, "mode": mode})

    @staticmethod
    def connection_status(connected, port=None):
        status = "CONNECTED" if connected else "DISCONNECTED"
        severity = "SUCCESS" if connected else "ERROR"
        msg = f"Hardware {status}" + (f" on {port}" if port else "")
        HardwareLogger.log(msg, severity, {"port": port})

hardware_logger = HardwareLogger()
