// Disease registry and selection utilities

const DISEASES = [
  { slug: 'general', name: 'General' },
  { slug: 'diabetes', name: 'Diabetes' },
  { slug: 'hypertension', name: 'Hypertension' },
  { slug: 'tuberculosis', name: 'Tuberculosis' },
  { slug: 'malaria', name: 'Malaria' }
];

const DISEASE_STORAGE_KEY = 'currentDisease';

function getCurrentDisease() {
  return localStorage.getItem(DISEASE_STORAGE_KEY) || 'general';
}

function setCurrentDisease(slug) {
  if (!slug) return;
  localStorage.setItem(DISEASE_STORAGE_KEY, slug);
  refreshForDiseaseChange();
}

function isAllDiseaseSelected() {
  return (localStorage.getItem(DISEASE_STORAGE_KEY) || 'general') === 'all';
}

function getEffectiveSaveDisease() {
  const cur = getCurrentDisease();
  return cur === 'all' ? 'general' : cur;
}

function filterItemsByDisease(items, disease) {
  if (!disease || disease === 'all') return items;
  return items.filter((x) => (x.disease || 'general') === disease);
}

function loadDiseaseOptions() {
  const sel = document.getElementById('diseaseSelect');
  if (!sel) return;
  sel.innerHTML = '';
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = 'All Topics';
  sel.appendChild(all);
  for (const d of DISEASES) {
    const o = document.createElement('option');
    o.value = d.slug;
    o.textContent = d.name;
    sel.appendChild(o);
  }
  const current = getCurrentDisease();
  sel.value = current;
  sel.onchange = () => {
    const val = sel.value;
    if (val === 'all') {
      localStorage.setItem(DISEASE_STORAGE_KEY, 'all');
      refreshForDiseaseChange();
    } else {
      setCurrentDisease(val);
    }
  };
}

function refreshForDiseaseChange() {
  try { if (typeof refreshLessons === 'function') refreshLessons(document.getElementById('searchInput')?.value || ''); } catch {}
  try { if (typeof refreshManageList === 'function') refreshManageList(); } catch {}
  try { if (typeof renderResources === 'function') renderResources(); } catch {}
  try { if (typeof renderThreads === 'function') renderThreads(); } catch {}
  try { if (typeof renderDashboards === 'function') renderDashboards(); } catch {}
}
