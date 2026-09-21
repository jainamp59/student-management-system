const API = '/api';
let students = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname.split('/').pop();
  if (path === 'login.html' || location.pathname.endsWith('/login.html')) initLogin();
  else initDashboard();
});

function initLogin(){
  const form = document.getElementById('loginForm');
  const toggle = document.getElementById('togglePassword');
  toggle?.addEventListener('click', () => {
    const p = document.getElementById('password');
    p.type = p.type === 'password' ? 'text' : 'password';
    toggle.textContent = p.type === 'password' ? 'Show' : 'Hide';
  });
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('loginMessage');
    msg.textContent = 'Signing in...';
    try{
      const res = await fetch(`${API}/login.php`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      })});
      const data = await res.json();
      if(data.success){ location.href = 'index.html'; }
      else msg.textContent = data.message || 'Invalid login details.';
    }catch(err){ msg.textContent = 'Cannot connect to the PHP backend. Check your server.'; }
  });
}

async function initDashboard(){
  try{
    const me = await fetch(`${API}/me.php`).then(r=>r.json());
    if(!me.authenticated){ location.href='login.html'; return; }
  }catch(e){ /* local UI remains usable if API is not started yet */ }

  setupNavigation();
  setupStudentForm();
  loadStudents();
  setupSearch();
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
  setTimeout(drawChart, 300);
}

function setupNavigation(){
  document.querySelectorAll('.nav-item, .text-link').forEach(a=>{
    a.addEventListener('click', e=>{
      const page = a.dataset.page || (a.getAttribute('href')||'').replace('#','');
      if(!page) return;
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      document.getElementById(page)?.classList.add('active');
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.page===page));
      const titles={dashboard:'Dashboard',students:'Students',courses:'Courses',attendance:'Attendance',fees:'Fees',results:'Results',reports:'Reports',settings:'Settings'};
      document.getElementById('pageTitle').textContent=titles[page]||'Dashboard';
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

async function loadStudents(){
  try{
    const res = await fetch(`${API}/students.php`);
    const data = await res.json();
    if(data.success){ students=data.students; renderStudents(); renderRecent(); updateStats(); }
  }catch(e){
    students = [];
    renderStudents();
    renderRecent();
    updateStats();
  }
}

function renderStudents(){
  const tbody=document.getElementById('studentsTable');
  if(!tbody) return;
  const query=(document.getElementById('studentSearch')?.value||'').toLowerCase();
  const status=document.getElementById('statusFilter')?.value||'';
  const list=students.filter(s=>{
    const text=`${s.first_name} ${s.last_name} ${s.student_id} ${s.phone||''}`.toLowerCase();
    return text.includes(query) && (!status || s.status===status);
  });
  tbody.innerHTML=list.length ? list.map(studentRow).join('') : `<tr><td colspan="7"><div class="empty-state" style="padding:35px"><div>♙</div><h3>No students found</h3><p>Add a student or change your search.</p></div></td></tr>`;
}

function renderRecent(){
  const tbody=document.getElementById('recentStudents');
  if(!tbody) return;
  tbody.innerHTML=students.slice(0,5).map(s=>`<tr><td>${studentCell(s)}</td><td>${escapeHtml(s.student_id)}</td><td>${escapeHtml(s.course||'-')}</td><td>${escapeHtml(s.phone||'-')}</td><td>${statusBadge(s.status)}</td><td><button class="action-btn" onclick="editStudent(${s.id})">Edit</button></td></tr>`).join('');
}

function studentRow(s){
  return `<tr><td>${studentCell(s)}</td><td>${escapeHtml(s.student_id)}</td><td>${escapeHtml(s.course||'-')}</td><td>${escapeHtml(s.email||'-')}<br>${escapeHtml(s.phone||'')}</td><td>${escapeHtml(s.admission_date||'-')}</td><td>${statusBadge(s.status)}</td><td><button class="action-btn" onclick="editStudent(${s.id})">Edit</button><button class="action-btn delete" onclick="deleteStudent(${s.id})">Delete</button></td></tr>`;
}
function studentCell(s){const initials=((s.first_name||'')[0]+(s.last_name||'')[0]).toUpperCase();return `<div class="student-name"><div class="student-avatar">${escapeHtml(initials)}</div><span>${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</span></div>`}
function statusBadge(status){return `<span class="badge ${status==='Active'?'active':'inactive'}">${escapeHtml(status||'Active')}</span>`}

function updateStats(){
  const total=students.length, active=students.filter(s=>s.status==='Active').length;
  document.getElementById('totalStudents').textContent=total;
  document.getElementById('totalCourses').textContent=4;
  document.getElementById('attendanceRate').textContent='92%';
  document.getElementById('feesCollected').textContent='₹8.42L';
  const activePct=total?Math.round(active/total*100):0;
  document.getElementById('activePercent').textContent=activePct+'%';
  document.getElementById('feePercent').textContent='81.9%';
  document.getElementById('attendancePercent').textContent='92%';
  document.getElementById('activeBar').style.width=activePct+'%';
  document.getElementById('feeBar').style.width='81.9%';
  document.getElementById('attendanceBar').style.width='92%';
}

function setupSearch(){
  document.getElementById('studentSearch')?.addEventListener('input',renderStudents);
  document.getElementById('statusFilter')?.addEventListener('change',renderStudents);
  document.getElementById('globalSearch')?.addEventListener('input',e=>{
    document.getElementById('studentSearch').value=e.target.value;
    document.querySelector('[data-page="students"]').click();
    renderStudents();
  });
}

function setupStudentForm(){
  document.getElementById('studentForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const payload={
      id: document.getElementById('studentDbId').value || null,
      first_name: document.getElementById('firstName').value,
      last_name: document.getElementById('lastName').value,
      email: document.getElementById('studentEmail').value,
      phone: document.getElementById('studentPhone').value,
      gender: document.getElementById('gender').value,
      dob: document.getElementById('dob').value || null,
      course: document.getElementById('course').value,
      status: document.getElementById('studentStatus').value,
      address: document.getElementById('address').value
    };
    const method=payload.id?'PUT':'POST';
    try{
      const res=await fetch(`${API}/students.php`,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json();
      if(data.success){closeStudentModal();showToast(payload.id?'Student updated':'Student added successfully');loadStudents();}
      else showToast(data.message||'Unable to save student');
    }catch(e){showToast('PHP backend is not connected');}
  });
}

function openStudentModal(student=null){
  editingId=student?.id||null;
  document.getElementById('modalTitle').textContent=student?'Edit Student':'Add Student';
  document.getElementById('studentDbId').value=student?.id||'';
  document.getElementById('firstName').value=student?.first_name||'';
  document.getElementById('lastName').value=student?.last_name||'';
  document.getElementById('studentEmail').value=student?.email||'';
  document.getElementById('studentPhone').value=student?.phone||'';
  document.getElementById('gender').value=student?.gender||'Male';
  document.getElementById('dob').value=student?.dob||'';
  document.getElementById('course').value=student?.course||'BCA';
  document.getElementById('studentStatus').value=student?.status||'Active';
  document.getElementById('address').value=student?.address||'';
  document.getElementById('studentModal').classList.add('show');
}
function closeStudentModal(){document.getElementById('studentModal').classList.remove('show')}
function editStudent(id){const s=students.find(x=>Number(x.id)===Number(id));if(s)openStudentModal(s)}
async function deleteStudent(id){
  if(!confirm('Delete this student? This action cannot be undone.')) return;
  try{
    const res=await fetch(`${API}/students.php?id=${id}`,{method:'DELETE'});
    const data=await res.json();
    if(data.success){showToast('Student deleted');loadStudents();}else showToast(data.message||'Delete failed');
  }catch(e){showToast('PHP backend is not connected');}
}
async function logout(){
  try{await fetch(`${API}/logout.php`,{method:'POST'});}catch(e){}
  location.href='login.html';
}
function showToast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function drawChart(){
  const canvas=document.getElementById('enrollmentChart');
  if(!canvas || typeof Chart==='undefined') return;
  new Chart(canvas,{type:'line',data:{labels:['Apr','May','Jun','Jul','Aug','Sep'],datasets:[{label:'New Students',data:[18,27,22,34,31,42],borderWidth:3,tension:.4,fill:true,backgroundColor:'rgba(91,85,232,.08)',borderColor:'#5b55e8',pointBackgroundColor:'#fff',pointBorderColor:'#5b55e8',pointBorderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#edf0f4'},ticks:{font:{size:9}}},x:{grid:{display:false},ticks:{font:{size:9}}}}}});
}
