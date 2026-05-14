import re
import shlex

class CommandParser:
    """
    SHELL COMMAND PARSER ENGINE.
    Responsible for tokenizing strings, handling quotes, and extracting key-value arguments.
    """
    
    @staticmethod
    def parse(command_str):
        """
        Parses a command string into a dictionary:
        {
            "command": "spawn",
            "args": ["chrome"],
            "kwargs": {"priority": "8", "burst": "20"}
        }
        """
        if not command_str or not command_str.strip():
            return None
            
        try:
            # Use shlex to handle quoted strings correctly
            tokens = shlex.split(command_str)
        except ValueError:
            # Handle unbalanced quotes gracefully
            tokens = command_str.split()
            
        if not tokens:
            return None
            
        command = tokens[0].lower()
        args = []
        kwargs = {}
        
        for token in tokens[1:]:
            if "=" in token:
                key, val = token.split("=", 1)
                kwargs[key.lower()] = val
            else:
                args.append(token)
                
        return {
            "command": command,
            "args": args,
            "kwargs": kwargs
        }

command_parser = CommandParser()
