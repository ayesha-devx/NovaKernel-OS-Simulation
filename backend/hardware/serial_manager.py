import serial
import serial.tools.list_ports
import threading
import time
import queue
from hardware.hardware_state import hardware_state_manager
from hardware.hardware_logger import hardware_logger
from hardware.mock_hardware import mock_hardware
from kernel.socket_bus import socket_bus

class SerialManager:
    """
    LOW-LEVEL SERIAL COMMUNICATION.
    Handles physical port discovery, auto-reconnect, and command queuing.
    """
    def __init__(self, baudrate=9600):
        self.baudrate = baudrate
        self.ser = None
        self.command_queue = queue.Queue(maxsize=50) # Capped to prevent memory leak
        self.is_running = True
        
        # Start Communication Threads
        self.connection_thread = threading.Thread(target=self._connection_loop, daemon=True)
        self.sender_thread = threading.Thread(target=self._sender_loop, daemon=True)
        
        self.connection_thread.start()
        self.sender_thread.start()

    def send(self, command):
        """Adds a command to the outgoing queue. Non-blocking."""
        try:
            self.command_queue.put(command, block=False)
        except queue.Full:
            # Drop command if queue is backed up to prevent memory pressure
            pass

    def _connection_loop(self):
        """Monitors and maintains the serial connection."""
        while self.is_running:
            if not hardware_state_manager.simulation_mode and not hardware_state_manager.connected:
                self._attempt_connection()
            time.sleep(5) # Check every 5 seconds

    def _attempt_connection(self):
        """Finds and connects to the Arduino board."""
        ports = list(serial.tools.list_ports.comports())
        target_port = None
        
        for port in ports:
            # Common Arduino/CH340 identifiers
            if "Arduino" in port.description or "CH340" in port.description or "USB-SERIAL" in port.description:
                target_port = port.device
                break
        
        if target_port:
            try:
                hardware_state_manager.reconnect_attempts += 1
                self.ser = serial.Serial(target_port, self.baudrate, timeout=1, write_timeout=2)
                hardware_state_manager.connected = True
                hardware_state_manager.port = target_port
                hardware_logger.connection_status(True, target_port)
                # Immediate sync on connection
                socket_bus.emit_raw('HARDWARE_STATE_UPDATE', hardware_state_manager.to_dict())
            except Exception as e:
                hardware_state_manager.connected = False
                # hardware_logger.log(f"Connection failed on {target_port}: {str(e)}", "ERROR")
        else:
            # No Arduino found
            pass

    def _sender_loop(self):
        """Consumes the command queue and sends to Hardware or Mock."""
        while self.is_running:
            try:
                command = self.command_queue.get(timeout=1)
                
                # EXECUTE COMMAND
                if hardware_state_manager.connected and self.ser:
                    try:
                        self.ser.write(f"{command}\n".encode())
                        hardware_logger.command_sent(command, "HARDWARE")
                    except:
                        hardware_state_manager.connected = False
                        hardware_logger.connection_status(False)
                        # Immediate sync on failure
                        socket_bus.emit_raw('HARDWARE_STATE_UPDATE', hardware_state_manager.to_dict())
                        # Fallback to Mock immediately if hardware fails
                        mock_hardware.process_command(command)
                else:
                    # SIMULATION MODE
                    mock_hardware.process_command(command)
                    hardware_logger.command_sent(command, "SIMULATION")
                
                self.command_queue.task_done()
            except queue.Empty:
                continue

    def close(self):
        self.is_running = False
        if self.ser:
            self.ser.close()

serial_manager = SerialManager()
