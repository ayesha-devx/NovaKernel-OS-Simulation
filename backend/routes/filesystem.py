from flask import Blueprint, request, jsonify
from os_modules.file_system import fs_engine

filesystem_bp = Blueprint('filesystem', __name__)

@filesystem_bp.route('/state', methods=['GET'])
def get_state():
    return jsonify(fs_engine.get_state())

@filesystem_bp.route('/create', methods=['POST'])
def create_file():
    data = request.json
    filename = data.get('filename')
    owner = data.get('owner', 'system')
    return jsonify(fs_engine.create_file(filename, owner))

@filesystem_bp.route('/write', methods=['POST'])
def write_file():
    data = request.json
    filename = data.get('filename')
    content = data.get('content', '')
    return jsonify(fs_engine.write_file(filename, content))

@filesystem_bp.route('/read/<filename>', methods=['GET'])
def read_file(filename):
    return jsonify(fs_engine.read_file(filename))

@filesystem_bp.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    return jsonify(fs_engine.delete_file(filename))

@filesystem_bp.route('/reset', methods=['POST'])
def reset_filesystem():
    from os_modules.file_system import FileSystem
    import os_modules.file_system
    os_modules.file_system.fs_engine = FileSystem()
    os_modules.file_system.fs_engine.set_dependencies(fs_engine.socketio, fs_engine.event_logger)
    os_modules.file_system.fs_engine._notify_update()
    return jsonify({"success": True, "message": "Filesystem re-initialized"})
