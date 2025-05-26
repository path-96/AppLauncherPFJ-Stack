window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.shortcut-icon').forEach(img => {
    const filePath = img.getAttribute('data-path');
    if (window.electronAPI && window.electronAPI.getIcon) {
      window.electronAPI.getIcon(filePath).then(iconDataUrl => {
        if (iconDataUrl) {
          img.src = iconDataUrl;
        } else {
          img.src = 'default-icon.png';
        }
      });
    }
  });

  // Make shortcut cards clickable
  document.querySelectorAll('.shortcut-card').forEach(card => {
    card.addEventListener('click', () => {
      const path = card.getAttribute('data-path');
      fetch('/launch_shortcut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
    });
  });

  // Drag-and-drop and browse
  document.querySelectorAll('.add-shortcut-form').forEach(form => {
    const pathInput = form.querySelector('.shortcut-path-input');
    const dragArea = form.querySelector('.drag-drop-area');
    const browseBtn = form.querySelector('.browse-btn');

    // Drag and drop
    dragArea.addEventListener('dragover', e => {
      e.preventDefault();
      dragArea.classList.add('bg-info');
    });
    dragArea.addEventListener('dragleave', e => {
      e.preventDefault();
      dragArea.classList.remove('bg-info');
    });
    dragArea.addEventListener('drop', e => {
      e.preventDefault();
      dragArea.classList.remove('bg-info');
      const file = e.dataTransfer.files[0];
      if (file && file.path) {
        pathInput.value = file.path;
      }
    });

    // Browse button (Electron only)
    if (window.electronAPI && window.electronAPI.showOpenDialog) {
      browseBtn.addEventListener('click', async () => {
        const filePath = await window.electronAPI.showOpenDialog();
        if (filePath) pathInput.value = filePath;
      });
    } else {
      browseBtn.disabled = true;
    }
  });

  // Edit shortcut
  document.querySelectorAll('.edit-shortcut-btn').forEach(btn => {
  btn.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent card click
    const projectIdx = btn.getAttribute('data-project');
    const shortcutIdx = btn.getAttribute('data-shortcut');
    const newName = prompt('Enter new shortcut name:');
    if (newName) {
      fetch(`/edit_shortcut/${projectIdx}/${shortcutIdx}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      }).then(() => location.reload());
    }
  });
});

  // Delete shortcut
  document.querySelectorAll('.delete-shortcut-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent card click
      const projectIdx = btn.getAttribute('data-project');
      const shortcutIdx = btn.getAttribute('data-shortcut');
      if (confirm('Delete this shortcut?')) {
        fetch(`/delete_shortcut/${projectIdx}/${shortcutIdx}`, { method: 'POST' })
          .then(() => location.reload());
      }
    });
  });
});