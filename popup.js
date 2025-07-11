// Update timestamp
function updateTimestamp() {
  const now = new Date();
  const timestamp = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('timestamp').textContent = timestamp;
}

// Update timestamp every second
setInterval(updateTimestamp, 1000);
updateTimestamp();

// Category display names
const categoryNames = {
  'sql': 'SQL Injection',
  'xss': 'XSS',
  'rce': 'RCE',
  'reverse-shell': 'Reverse Shell',
  'lfi': 'LFI/RFI',
  'ssrf': 'SSRF',
  'xxe': 'XXE',
  'deserialization': 'Deserialization',
  'authentication': 'Authentication',
  'authorization': 'Authorization',
  'command': 'Command Injection',
  'other': 'Other'
};

// Get filtered and sorted payloads
function getFilteredPayloads() {
  const payloads = JSON.parse(localStorage.getItem("payloads") || "[]");
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  const categoryFilter = document.getElementById("category-filter").value;
  const sortBy = document.getElementById("sort-by").value;

  // Filter by search term
  let filtered = payloads.filter(payload => {
    const matchesSearch = !searchTerm || 
      payload.name.toLowerCase().includes(searchTerm) ||
      payload.content.toLowerCase().includes(searchTerm) ||
      (payload.tags && payload.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
    
    const matchesCategory = !categoryFilter || payload.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sort payloads
  filtered.sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'date':
        return new Date(b.date || 0) - new Date(a.date || 0);
      default:
        return 0;
    }
  });

  return filtered;
}

function loadPayloads() {
  const payloads = getFilteredPayloads();
  const container = document.getElementById("payloads");
  container.innerHTML = "";

  if (payloads.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; opacity: 0.7; font-style: italic;">
        No payloads found.<br>
        <span style="font-size: 12px; color: #00ffff;">Add your first payload above.</span>
      </div>
    `;
    return;
  }

  payloads.forEach((payload, index) => {
    const div = document.createElement("div");
    div.className = "payload";

    // Format tags
    const tagsHtml = payload.tags && payload.tags.length > 0 
      ? `<div class="payload-tags">${payload.tags.map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}</div>`
      : '';

    // Format date
    const dateStr = payload.date ? new Date(payload.date).toLocaleDateString() : 'Unknown date';

    div.innerHTML = `
      <div class="payload-header">
        <div class="payload-name">${payload.name}</div>
        ${payload.category ? `<div class="payload-category category-${payload.category}">${categoryNames[payload.category] || payload.category}</div>` : ''}
      </div>
      <div class="payload-meta">Added: ${dateStr}</div>
      ${tagsHtml}
      <textarea readonly style="width:100%;height:60px;">${payload.content}</textarea>
      <div class="buttons">
        <button class="copy">COPY</button>
        <button class="delete">DELETE</button>
      </div>
    `;

    div.querySelector(".copy").addEventListener("click", () => {
      navigator.clipboard.writeText(payload.content).then(() => {
        // Show success feedback
        const btn = div.querySelector(".copy");
        const originalText = btn.textContent;
        btn.textContent = "COPIED!";
        btn.style.background = "linear-gradient(45deg, #00ff41, #00cc33)";
        btn.style.color = "#000";
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = "linear-gradient(45deg, #0066ff, #0099ff)";
          btn.style.color = "white";
        }, 1500);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });

    div.querySelector(".delete").addEventListener("click", () => {
      if (confirm(`Delete payload "${payload.name}"?`)) {
        const allPayloads = JSON.parse(localStorage.getItem("payloads") || "[]");
        const payloadIndex = allPayloads.findIndex(p => 
          p.name === payload.name && p.content === payload.content
        );
        if (payloadIndex !== -1) {
          allPayloads.splice(payloadIndex, 1);
          localStorage.setItem("payloads", JSON.stringify(allPayloads));
          loadPayloads();
        }
      }
    });

    container.appendChild(div);
  });
}

// Add event listeners for search and filters
document.getElementById("search-input").addEventListener("input", loadPayloads);
document.getElementById("category-filter").addEventListener("change", loadPayloads);
document.getElementById("sort-by").addEventListener("change", loadPayloads);

// Add close button functionality
document.getElementById("close-btn").addEventListener("click", () => {
  window.close();
});

// Add delete all payloads functionality
function deleteAllPayloads() {
  const payloads = JSON.parse(localStorage.getItem("payloads") || "[]");
  if (payloads.length === 0) {
    alert("No payloads to delete!");
    return;
  }
  
  if (confirm(`Are you sure you want to delete ALL ${payloads.length} payloads? This action cannot be undone.`)) {
    localStorage.removeItem("payloads");
    loadPayloads();
    
    // Show success message
    const successDiv = document.createElement("div");
    successDiv.className = "success";
    successDiv.textContent = "All payloads deleted successfully!";
    successDiv.style.marginTop = "10px";
    
    const payloadsContainer = document.querySelector(".payloads-container");
    const existingSuccess = payloadsContainer.querySelector(".success");
    if (existingSuccess) existingSuccess.remove();
    
    payloadsContainer.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }
}

// Add delete all button event listener
document.getElementById("delete-all-btn").addEventListener("click", deleteAllPayloads);

document.getElementById("add-btn").addEventListener("click", () => {
  const name = document.getElementById("payload-name").value.trim();
  const content = document.getElementById("payload-content").value.trim();
  const category = document.getElementById("payload-category").value;
  const tagsInput = document.getElementById("payload-tags").value.trim();

  if (!name || !content) {
    // Show error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = "Name and payload content are required!";
    errorDiv.style.marginTop = "10px";
    
    const addSection = document.getElementById("add-section");
    const existingError = addSection.querySelector(".error");
    if (existingError) existingError.remove();
    
    addSection.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
    return;
  }

  // Process tags
  const tags = tagsInput 
    ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  const payloads = JSON.parse(localStorage.getItem("payloads") || "[]");
  payloads.push({ 
    name, 
    content, 
    category, 
    tags,
    date: new Date().toISOString()
  });
  localStorage.setItem("payloads", JSON.stringify(payloads));

  // Clear form
  document.getElementById("payload-name").value = "";
  document.getElementById("payload-content").value = "";
  document.getElementById("payload-category").value = "";
  document.getElementById("payload-tags").value = "";

  // Show success message
  const successDiv = document.createElement("div");
  successDiv.className = "success";
  successDiv.textContent = `Payload "${name}" added successfully!`;
  successDiv.style.marginTop = "10px";
  
  const addSection = document.getElementById("add-section");
  const existingSuccess = addSection.querySelector(".success");
  if (existingSuccess) existingSuccess.remove();
  
  addSection.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);

  loadPayloads();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter to add payload
  if (e.ctrlKey && e.key === 'Enter') {
    document.getElementById("add-btn").click();
  }
  
  // Escape to clear form
  if (e.key === 'Escape') {
    document.getElementById("payload-name").value = "";
    document.getElementById("payload-content").value = "";
    document.getElementById("payload-category").value = "";
    document.getElementById("payload-tags").value = "";
  }
});

// Initialize
loadPayloads();
