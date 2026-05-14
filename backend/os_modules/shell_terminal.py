import time
from kernel.socket_bus import socket_bus
from os_modules.command_parser import command_parser
from os_modules.command_router import command_router

class ShellTerminal:
    """
    SHELL TERMINAL CONTROLLER.
    Interface between the frontend Terminal and the Kernel Command Router.
    """
    def __init__(self):
        self.history = []
        self.session_output = [] # Persisted output stream
        self.aliases = {
            "ll": "ls",
            "dir": "ls",
            "cls": "clear"
        }

    def execute(self, command_line):
        """
        Executes a raw command line string.
        Returns a response object for the frontend.
        """
        if not command_line or not command_line.strip():
            return {"output": "", "status": "success"}

        # 1. Log to history (commands only)
        self.history.append(command_line)
        if len(self.history) > 100:
            self.history.pop(0)

        # 2. Check for internal shell commands
        cmd_clean = command_line.strip().lower()
        if cmd_clean == "clear":
            self.session_output = []
            return {"output": "", "status": "clear"}
            
        # 3. Handle Aliases
        tokens = command_line.split()
        cmd_base = tokens[0].lower()
        if cmd_base in self.aliases:
            command_line = self.aliases[cmd_base] + " " + " ".join(tokens[1:])

        # 4. Parse Command
        parsed = command_parser.parse(command_line)
        if not parsed:
            return {"output": "ERROR: Parsing failed.", "status": "error"}

        # 5. Emit Kernel Event for command execution
        socket_bus.emit("SHELL", "CMD_EXEC", f"Executed: {command_line}", "INFO")
        
        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event("SHELL", "COMMAND_EXEC", f"Shell CMD: {command_line}", metadata={"command": command_line})

        # 6. Route to kernel modules
        start_time = time.time()
        output = command_router.route(parsed)
        execution_time = round((time.time() - start_time) * 1000, 2) # in ms

        status = "error" if output.startswith("ERROR") else "success"
        
        result = {
            "output": output,
            "status": status,
            "execution_time": execution_time,
            "command": parsed["command"]
        }

        # 7. Store in session output for persistence
        self.session_output.append({
            "command": command_line,
            "result": result
        })
        if len(self.session_output) > 50:
            self.session_output.pop(0)

        return result

shell_terminal = ShellTerminal()
