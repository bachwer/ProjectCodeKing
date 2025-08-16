let currentTab = 'dashboard';

function switchTab(tabName, element) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(tabName + '-tab').style.display = 'block';
    element.classList.add('active');
    currentTab = tabName;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function toggleUserMenu() {
    console.log('User menu toggled');
}

function handleSearch(query) {
    console.log('Searching for:', query);
}

function refreshData() {
    const loading = document.getElementById('refresh-loading');
    loading.style.display = 'inline-block';
    setTimeout(() => {
        loading.style.display = 'none';
    }, 1500);
}

function openProblemModal() {
    document.getElementById('problemForm').reset();
    document.getElementById('modalTitle').innerText = 'Add Problem';
    document.getElementById('problemModal').style.display = 'flex';
}
function closeProblemModal() {
    document.getElementById('problemModal').style.display = 'none';
}

function addUser() {
    document.getElementById('userForm').reset();
    document.getElementById('userModalTitle').innerText = 'Add User';
    document.getElementById('userModal').style.display = 'flex';
}
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function openEditProblemModal() {
  document.getElementById("editProblemModal").style.display = "flex";
}
function closeEditProblemModal() {
  document.getElementById("editProblemModal").style.display = "none";
}

function openDeleteProblemModal() {
  document.getElementById("deleteProblemModal").style.display = "flex";
}
function closeDeleteProblemModal() {
  document.getElementById("deleteProblemModal").style.display = "none";
}

function openImportProblemModal() {
  document.getElementById("importProblemModal").style.display = "flex";
}
function closeImportProblemModal() {
  document.getElementById("importProblemModal").style.display = "none";
}

function openEditUserModal() {
  document.getElementById("editUserModal").style.display = "flex";
}
function closeEditUserModal() {
  document.getElementById("editUserModal").style.display = "none";
}

function openDeleteUserModal() {
  document.getElementById("deleteUserModal").style.display = "flex";
}
function closeDeleteUserModal() {
  document.getElementById("deleteUserModal").style.display = "none";
}

function openImportUserModal() {
  document.getElementById("importUserModal").style.display = "flex";
}
function closeImportUserModal() {
  document.getElementById("importUserModal").style.display = "none";
}

// Đảm bảo các nút thêm & import problem hoạt động
window.addEventListener('DOMContentLoaded', () => {
    const addProblemBtn = document.querySelector("#problems-tab .btn.btn-primary");
    if (addProblemBtn && addProblemBtn.textContent.includes('Add Problem')) {
        addProblemBtn.onclick = () => openProblemModal();
    }

    const importBtn = document.querySelector("#problems-tab .btn.btn-secondary");
    if (importBtn && importBtn.textContent.trim().toLowerCase() === 'import') {
        importBtn.onclick = () => openImportProblemModal();
    }

    const editBtns = document.querySelectorAll('#problems-tab .action-btn.edit');
    editBtns.forEach(btn => btn.onclick = () => openEditProblemModal());

    const deleteBtns = document.querySelectorAll('#problems-tab .action-btn.delete');
    deleteBtns.forEach(btn => btn.onclick = () => openDeleteProblemModal());

    const editUserBtns = document.querySelectorAll('#users-tab .action-btn.edit');
    editUserBtns.forEach(btn => btn.onclick = () => openEditUserModal());

    const suspendBtns = document.querySelectorAll('#users-tab .action-btn.delete');
    suspendBtns.forEach(btn => btn.onclick = () => openDeleteUserModal());

    const exportBtn = document.querySelector("#users-tab .btn.btn-secondary");
    if (exportBtn && exportBtn.textContent.trim().toLowerCase() === 'export') {
        exportBtn.onclick = () => openImportUserModal();
    }
});

setInterval(() => {
    const timeElements = document.querySelectorAll('#activity-table td:last-child');
    timeElements.forEach(el => {
        const minutes = parseInt(el.textContent) + 1;
        el.textContent = minutes + ' min ago';
    });
}, 60000);

setInterval(() => {
    if (currentTab === 'dashboard') {
        document.querySelectorAll('.stat-value').forEach(stat => {
            const currentValue = parseInt(stat.textContent.replace(/,/g, ''));
            const variation = Math.floor(Math.random() * 10) - 5;
            const newValue = Math.max(0, currentValue + variation);
            stat.textContent = newValue.toLocaleString();
        });
    }
}, 30000);

window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.style.display === 'flex' && event.target === modal) {
            modal.style.display = 'none';
        }
    });
});