from flask import Blueprint, request, jsonify
from os_modules.shell_terminal import shell_terminal

shell_bp = Blueprint('shell', __name__)

@shell_bp.route('/execute', methods=['POST'])
def execute_command():
    data = request.get_json()
    command = data.get('command', '')
    
    if not command:
        return jsonify({"error": "No command provided"}), 400
        
    result = shell_terminal.execute(command)
    return jsonify(result)

@shell_bp.route('/history', methods=['GET'])
def get_history():
    return jsonify({"history": shell_terminal.history})

@shell_bp.route('/session', methods=['GET'])
def get_session():
    return jsonify({"session": shell_terminal.session_output})

@shell_bp.route('/aliases', methods=['GET'])
def get_aliases():
    return jsonify({"aliases": shell_terminal.aliases})
