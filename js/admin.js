let form, loadBtn, deleteBtn, saveBtn, statusDiv;

const notyf = new Notyf();

function showMessage(text, type) {
    if (type === 'success') {
      notyf.success(text);
    } else {
      notyf.error(text);
    }
  }

async function loadProblem() {
  const problemId = document.getElementById('manage-id').value;
  if (!problemId) return;
  try {
    const resp = await fetch(`https://api.quantapus.com/problems/${problemId}`);
    if (!resp.ok) throw new Error('Problem not found');
    const data = await resp.json();
    populateForm(data);
    showMessage('Problem loaded!', 'success');
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

function populateForm(data) {
  form.id.value                 = data.id;
  form.title.value              = data.title;
  form.difficulty.value         = data.difficulty;
  form.category.value           = data.category;
  form.description.value        = data.description;
  form.solution.value           = data.solution;
  form.explanation.value        = data.explanation;
  form.yt_link.value            = data.yt_link || '';
  form.roadmap.value            = data.roadmap || '';
  form.subcategory.value        = data.subcategory || '';
  form.subcategory_order.value  = data.subcategory_order  ?? '';
  form.subcategory_rank.value   = data.subcategory_rank   ?? '';
}

async function deleteProblem() {
  const problemId = document.getElementById('manage-id').value;
  if (!problemId || !confirm('Are you sure?')) return;
  try {
    const resp = await fetch(`https://api.quantapus.com/problems/${problemId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretKey: form.secretKey.value })
    });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || 'Delete failed');
    }
    showMessage('Problem deleted!', 'success');
    form.reset();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function submitForm(e) {
  e.preventDefault();
  const isUpdate = form.updateMode.checked;
  const method   = isUpdate ? 'PUT' : 'POST';
  const url      = isUpdate
    ? `https://api.quantapus.com/problems/${form.id.value}`
    : `https://api.quantapus.com/admin/post`;

  const body = {
    secretKey: form.secretKey.value,
    problem: {
      id:              form.id.value,
      title:           form.title.value,
      difficulty:      form.difficulty.value,
      category:        form.category.value,
      roadmap:         form.roadmap.value,
      subcategory:     form.subcategory.value,
      subcategory_order: form.subcategory_order.value || null,
      subcategory_rank:  form.subcategory_rank.value  || null,
      description:     form.description.value,
      solution:        form.solution.value,
      explanation:     form.explanation.value,
      yt_link:         form.yt_link.value || null
    }
  };

  try {
    const resp = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || 'Save failed');
    }
    showMessage(`Problem ${method === 'POST' ? 'added' : 'updated'}!`, 'success');
    if (method === 'POST') form.reset();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// ————————————————————————————————————————————————————————————————
// Ordering module
// ————————————————————————————————————————————————————————————————
function initOrdering() {
    const panel = document.getElementById('ordering-panel');
    if (!panel) return () => {};
    
    panel.innerHTML = `
  <h2>Reorder Subcategories & Problems</h2>
  <div style="margin: 12px 0;">
    <label for="order-roadmap">Roadmap:</label>
    <select id="order-roadmap" style="margin-left:8px"></select>
  </div>
  <table id="order-table" style="width:100%; border-collapse:collapse; display:none; margin-bottom:12px;">
    <thead>
      <tr>
        <th style="border:1px solid #ccc;padding:4px">Subcategory</th>
        <th style="border:1px solid #ccc;padding:4px">Problem ID</th>
        <th style="border:1px solid #ccc;padding:4px">Title</th>             
        <th style="border:1px solid #ccc;padding:4px">Subcat Order</th>
        <th style="border:1px solid #ccc;padding:4px">Problem Rank</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
  <button id="save-ordering" style="display:none;">Save Ordering</button>
`;
    panel.style.cssText = `
      margin-top: 40px;
      padding: 20px;
      border: 1px solid #dde1e4;
      border-radius: 6px;
      background: #f9f9f9;
    `;
  
    const roadmapSel = panel.querySelector('#order-roadmap');
    const table     = panel.querySelector('#order-table');
    const tbody     = table.querySelector('tbody');
    const saveBtn   = panel.querySelector('#save-ordering');
  
    // populate roadmap dropdown
    const roadmaps = [...new Set(
      window.cachedProblems.map(p => p.roadmap || 'Uncategorized')
    )].sort();
    roadmapSel.innerHTML = roadmaps
      .map(r => `<option value="${r}">${r}</option>`)
      .join('');
  
    roadmapSel.addEventListener('change', renderTable);
    saveBtn.addEventListener('click', saveOrdering);
  
    renderTable();  
  
    function renderTable() {
      const roadmap = roadmapSel.value;
      const probs = window.cachedProblems
        .filter(p => (p.roadmap||'') === roadmap)
        .sort((a,b) => {
          if (a.subcategory !== b.subcategory) {
            return (a.subcategory_order||0) - (b.subcategory_order||0);
          }
          return (a.subcategory_rank||0) - (b.subcategory_rank||0);
        });
  
      tbody.innerHTML = probs.map(p => `
        <tr data-id="${p.id}">
          <td style="border:1px solid #ccc;padding:4px">${p.subcategory||''}</td>
          <td style="border:1px solid #ccc;padding:4px">${p.id}</td>
            <td style="border:1px solid #ccc;padding:4px">${p.title||''}</td>
          <td style="border:1px solid #ccc;padding:4px">
            <input type="number" class="inp-order" value="${p.subcategory_order||0}" style="width:4em">
          </td>
          <td style="border:1px solid #ccc;padding:4px">
            <input type="number" class="inp-rank"  value="${p.subcategory_rank||0}"  style="width:4em">
          </td>
        </tr>
      `).join('');
  
      table.style.display = probs.length ? '' : 'none';
      saveBtn.style.display = probs.length ? '' : 'none';
    }
  
    async function saveOrdering() {
      const updates = Array.from(tbody.querySelectorAll('tr')).map(row => ({
        id:                +row.dataset.id,
        subcategory_order: +row.querySelector('.inp-order').value,
        subcategory_rank:  +row.querySelector('.inp-rank').value
      }));
      try {
        const resp = await fetch('https://api.quantapus.com/admin/problems/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates, secretKey: form.secretKey.value })
        });
        if (!resp.ok) throw await resp.json();
        notyf.success('Ordering saved!');
      } catch (err) {
        notyf.error(err.error || 'Failed to save ordering');
      }
    }
  
    return () => {
      roadmapSel.removeEventListener('change', renderTable);
      saveBtn.removeEventListener('click', saveOrdering);
      panel.innerHTML = '';
    };
  }  

window.initAdmin = async function() {
    
    await window.loadProblems();
  form      = document.getElementById('problem-form');
  loadBtn   = document.getElementById('manage-load-btn');
  deleteBtn = document.getElementById('manage-delete-btn');

  loadBtn.addEventListener('click', loadProblem);
  deleteBtn.addEventListener('click', deleteProblem);
  form.addEventListener('submit', submitForm);

  const cleanupOrdering = initOrdering();

  return () => {
    loadBtn.removeEventListener('click', loadProblem);
    deleteBtn.removeEventListener('click', deleteProblem);
    form.removeEventListener('submit', submitForm);
    cleanupOrdering();
  };
}
