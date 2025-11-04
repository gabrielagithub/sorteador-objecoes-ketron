const api = {
  list: '/api/objecoes',
  add: '/api/objecoes',
  sort: '/api/sortear'
};

async function fetchList(){
  const res = await fetch(api.list);
  const json = await res.json();
  return json.success ? json.data : [];
}

async function refresh(){
  const data = await fetchList();
  const listaEl = document.getElementById('lista');
  listaEl.innerHTML = '';
  data.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<span>${i+1}. ${escapeHtml(t)}</span>`;
    listaEl.appendChild(div);
  });
  document.getElementById('count').innerText = data.length;
}

function escapeHtml(text){
  return text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

async function addOne(text){
  const res = await fetch(api.add, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ text })
  });
  return res.json();
}

document.getElementById('btnAdd').addEventListener('click', async () => {
  const v = document.getElementById('inputObje').value.trim();
  if(!v){ alert('Digite uma objeção'); return; }
  await addOne(v);
  document.getElementById('inputObje').value = '';
  await refresh();
});

document.getElementById('btnBulk').addEventListener('click', async () => {
  const bulk = prompt('Cole as objeções (uma por linha):');
  if(!bulk) return;
  const linhas = bulk.split(/\r?\n/).map(s => s.trim()).filter(s => s);
  for(const l of linhas){
    await addOne(l);
  }
  await refresh();
});

document.getElementById('btnSortear').addEventListener('click', async () => {
  const res = await fetch(api.sort);
  const json = await res.json();
  const el = document.getElementById('resultado');
  if(json.success && json.data){
    el.innerText = json.data;
  } else {
    el.innerText = json.message || 'Nenhuma objeção disponível';
  }
});

document.getElementById('btnRefresh').addEventListener('click', refresh);

document.getElementById('btnExport').addEventListener('click', async () => {
  const data = await fetchList();
  const blob = new Blob([data.join('\n')], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'objeções.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById('btnClear').addEventListener('click', async () => {
  const ok = confirm('Deseja apagar todas as objeções? A ação é irreversível.');
  if(!ok) return;
  const res = await fetch('/api/limpar?token=ketron-clear', { method: 'POST' });
  const json = await res.json();
  if(json.success) alert('Arquivo limpo com sucesso');
  else alert('Não foi possível limpar: ' + (json.error || 'erro'));
  await refresh();
});

// startup
refresh();
