// script.js — simple UI client for POST /chat
(function(){
  // Point to your backend API. If you serve this HTML from file:// or another port,
  // we default to http://localhost:8000 where docker-compose exposes FastAPI.
  // Use Nginx proxy endpoints by default; if opened via file:// fallback to absolute http URL
  const DEFAULT_BASE = (location.protocol === 'http:' || location.protocol === 'https:')
    ? '/devops/api/chatbot'
    : 'http://localhost/devops/api/chatbot';
  const API_BASE = window.API_BASE || DEFAULT_BASE;
  // Fixed site id for this page/session
  const SITE_ID = 'omar';
  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('input');
  const composer = document.getElementById('composer');
  const statusEl = document.getElementById('status');
  let state = null; // conversation state from server

  function appendMessage(text, who='bot'){
    const wrapper = document.createElement('div');
    wrapper.className = `message ${who}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    // simple newline -> <br>
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight - messagesEl.clientHeight;
  }

  async function sendQuery(query){
    // show user message
    appendMessage(query, 'user');
    inputEl.value = '';
    inputEl.disabled = true;
    statusEl.textContent = 'Sending...';

    try{
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, state, site_id: SITE_ID })
      });

      if(!res.ok){
        const text = await res.text();
        appendMessage('❌ Error: ' + res.status + ' — ' + text);
        return;
      }

      const data = await res.json();
      // expected { response: string, new_state: string | null }
      appendMessage(data.response || '');
      state = data.new_state || null;
      statusEl.textContent = state ? `Waiting for: ${state}` : 'Connected';

    }catch(err){
      console.error(err);
  appendMessage('❌ Network error — could not reach ' + API_BASE + '/chat. Make sure the backend (via Nginx) is running.');
      statusEl.textContent = 'Error';
    }finally{
      inputEl.disabled = false;
      inputEl.focus();
    }
  }

  composer.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const text = inputEl.value.trim();
    if(!text) return;
    sendQuery(text);
  });

  // quick connection check
  (async function ping(){
    try{
      const r = await fetch(`${API_BASE}/health`);
      if(r.ok){ statusEl.textContent = 'Connected'; }
      else{ statusEl.textContent = 'Connected (health check failed)'; }
    }catch(e){ statusEl.textContent = 'Disconnected'; }
  })();

})();
