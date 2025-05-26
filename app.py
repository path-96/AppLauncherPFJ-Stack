import os
import json
import subprocess
import sys
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

DATA_FILE = os.path.join('data', 'projects.json')

def load_projects():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_projects(projects):
    with open(DATA_FILE, 'w') as f:
        json.dump(projects, f, indent=2)

@app.route('/')
def index():
    projects = load_projects()
    return render_template('index.html', projects=projects)

@app.route('/add_project', methods=['POST'])
def add_project():
    projects = load_projects()
    project_name = request.form.get('project_name')
    if project_name:
        projects.append({"name": project_name, "shortcuts": []})
        save_projects(projects)
    return redirect(url_for('index'))

@app.route('/add_shortcut/<int:project_index>', methods=['POST'])
def add_shortcut(project_index):
    projects = load_projects()
    shortcut_name = request.form.get('shortcut_name')
    shortcut_path = request.form.get('shortcut_path')
    if shortcut_name and shortcut_path and 0 <= project_index < len(projects):
        projects[project_index]['shortcuts'].append({
            "name": shortcut_name,
            "path": shortcut_path
        })
        save_projects(projects)
    return redirect(url_for('index'))

@app.route('/api/projects')
def api_projects():
    projects = load_projects()
    return {"projects": projects}

@app.route('/launch_shortcut', methods=['POST'])
def launch_shortcut():
    data = request.json
    path = data.get('path')
    if path:
        try:
            if sys.platform == "win32":
                os.startfile(path)
            else:
                subprocess.Popen(['open', path])
            return {"status": "success"}
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500
    return {"status": "error", "message": "No path provided"}, 400

@app.route('/edit_shortcut/<int:project_idx>/<int:shortcut_idx>', methods=['POST'])
def edit_shortcut(project_idx, shortcut_idx):
    projects = load_projects()
    data = request.json
    if 0 <= project_idx < len(projects) and 0 <= shortcut_idx < len(projects[project_idx]['shortcuts']):
        projects[project_idx]['shortcuts'][shortcut_idx]['name'] = data.get('name', '')
        save_projects(projects)
        return '', 204
    return '', 400

@app.route('/delete_shortcut/<int:project_idx>/<int:shortcut_idx>', methods=['POST'])
def delete_shortcut(project_idx, shortcut_idx):
    projects = load_projects()
    if 0 <= project_idx < len(projects) and 0 <= shortcut_idx < len(projects[project_idx]['shortcuts']):
        del projects[project_idx]['shortcuts'][shortcut_idx]
        save_projects(projects)
        return '', 204
    return '', 400

if __name__ == '__main__':
    app.run(debug=True)
# This is a simple Flask application that serves an index page.