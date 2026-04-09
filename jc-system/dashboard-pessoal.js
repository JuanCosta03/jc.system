// dashboard-pessoal.js - Sistema de gestão pessoal/familiar

let currentUser = null;
let profiles = [];
let transactions = [];

// Carregar dados do localStorage
function loadData() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userName').textContent = currentUser.name.split(' ')[0];
    
    // Carregar perfis
    const storedProfiles = localStorage.getItem(`profiles_${currentUser.id}`);
    if (storedProfiles) {
        profiles = JSON.parse(storedProfiles);
    } else {
        // Criar perfil geral padrão
        profiles = [
            { id: 'general', name: 'Geral', type: 'general', canEdit: true, members: [] }
        ];
        saveProfiles();
    }
    
    // Carregar transações
    const storedTransactions = localStorage.getItem(`transactions_${currentUser.id}`);
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    } else {
        transactions = [];
        saveTransactions();
    }
    
    renderCurrentPage();
}

function saveProfiles() {
    localStorage.setItem(`profiles_${currentUser.id}`, JSON.stringify(profiles));
}

function saveTransactions() {
    localStorage.setItem(`transactions_${currentUser.id}`, JSON.stringify(transactions));
}

// Renderização das páginas
function renderCurrentPage() {
    const activePage = document.querySelector('.nav-item.active')?.dataset.page || 'overview';
    const pageTitle = document.getElementById('pageTitle');
    const content = document.getElementById('pageContent');
    
    switch(activePage) {
        case 'overview':
            pageTitle.textContent = 'Visão Geral';
            renderOverview(content);
            break;
        case 'profiles':
            pageTitle.textContent = 'Gerenciar Perfis';
            renderProfiles(content);
            break;
        case 'transactions':
            pageTitle.textContent = 'Transações';
            renderTransactions(content);
            break;
        case 'calendar':
            pageTitle.textContent = 'Calendário de Contas';
            renderCalendar(content);
            break;
        case 'settings':
            pageTitle.textContent = 'Configurações';
            renderSettings(content);
            break;
    }
}

function renderOverview(container) {
    // Calcular totais
    const totalIn = transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.valor, 0);
    const totalOut = transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.valor, 0);
    const balance = totalIn - totalOut;
    
    const html = `
        <div class="cards-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; margin-bottom:30px;">
            <div class="card"><h3>Total de Entradas</h3><div class="value" style="font-size:28px; color:green;">R$ ${totalIn.toFixed(2)}</div></div>
            <div class="card"><h3>Total de Saídas</h3><div class="value" style="font-size:28px; color:red;">R$ ${totalOut.toFixed(2)}</div></div>
            <div class="card"><h3>Saldo Atual</h3><div class="value" style="font-size:28px; color:var(--blue-primary);">R$ ${balance.toFixed(2)}</div></div>
        </div>
        <div class="card">
            <h3>Últimas Transações</h3>
            <table style="width:100%; border-collapse:collapse;">
                <thead><tr><th>Data</th><th>Nome</th><th>Perfil</th><th>Valor</th><th>Tipo</th></tr></thead>
                <tbody>
                    ${transactions.slice(0,5).map(t => `
                        <tr><td>${new Date(t.data).toLocaleDateString()}</td><td>${t.nome}</td><td>${t.perfil}</td><td style="color:${t.type === 'entrada' ? 'green' : 'red'}">R$ ${t.valor.toFixed(2)}</td><td>${t.type === 'entrada' ? 'Entrada' : 'Saída'}</td></tr>
                    `).join('')}
                    ${transactions.length === 0 ? '<tr><td colspan="5">Nenhuma transação cadastrada</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    container.innerHTML = html;
}

function renderProfiles(container) {
    const generalProfile = profiles.find(p => p.type === 'general');
    const otherProfiles = profiles.filter(p => p.type !== 'general');
    
    let html = `
        <div class="card">
            <h3>Perfil Geral (Administrador)</h3>
            <div class="profile-card">
                <div><strong>${generalProfile.name}</strong><br><span class="profile-role">Pode adicionar/editar todas as transações</span></div>
            </div>
        </div>
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Perfis de Visualização</h3>
                <button class="btn-primary-sm" id="addProfileBtn">+ Adicionar Perfil</button>
            </div>
            <div id="profilesList">
                ${otherProfiles.map(p => `
                    <div class="profile-card">
                        <div><strong>${p.name}</strong><br><span class="profile-role">Apenas consulta</span></div>
                        <button class="btn-danger-sm" data-id="${p.id}" style="background:#DC2626; color:white; border:none; padding:6px12px; border-radius:6px;">Excluir</button>
                    </div>
                `).join('')}
                ${otherProfiles.length === 0 ? '<p>Nenhum perfil adicional. Clique em "Adicionar Perfil" para criar perfis para familiares.</p>' : ''}
            </div>
        </div>
    `;
    container.innerHTML = html;
    
    document.getElementById('addProfileBtn')?.addEventListener('click', () => {
        const name = prompt('Nome do perfil (ex: Filho, Esposa):');
        if (name) {
            profiles.push({ id: Date.now().toString(), name, type: 'viewer', canEdit: false });
            saveProfiles();
            renderProfiles(container);
        }
    });
    
    document.querySelectorAll('.btn-danger-sm').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            profiles = profiles.filter(p => p.id !== id);
            saveProfiles();
            renderProfiles(container);
        });
    });
}

function renderTransactions(container) {
    const generalProfile = profiles.find(p => p.type === 'general');
    const canEdit = currentUser.plan === 'familiar' ? true : (generalProfile && generalProfile.canEdit);
    
    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3>Lançar Transação</h3>
                ${canEdit ? '<button class="btn-primary-sm" id="newTransactionBtn">+ Nova Transação</button>' : '<span class="profile-role">Apenas o perfil Geral pode adicionar transações</span>'}
            </div>
            <div id="transactionForm" style="display:none;" class="form-grid">
                <input type="text" id="transName" placeholder="Nome da transação" class="form-input">
                <select id="transType"><option value="entrada">Entrada (Receita)</option><option value="saida">Saída (Despesa)</option></select>
                <input type="number" id="transValue" placeholder="Valor" step="0.01" class="form-input">
                <input type="date" id="transDate" class="form-input">
                <select id="transProfile">
                    ${profiles.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                </select>
                <select id="transFixed"><option value="variavel">Variável</option><option value="fixa">Fixa (recorrente)</option></select>
                <input type="number" id="transInstallments" placeholder="Parcelas (1 para à vista)" class="form-input">
                <input type="date" id="transDueDate" placeholder="Vencimento (se houver)" class="form-input">
                <button id="saveTransactionBtn" class="btn-primary-sm">Salvar</button>
            </div>
        </div>
        <div class="card">
            <h3>Todas as Transações</h3>
            <table style="width:100%; border-collapse:collapse;">
                <thead><tr><th>Data</th><th>Nome</th><th>Perfil</th><th>Valor</th><th>Tipo</th><th>Fixo/Var</th><th>Parcelas</th></tr></thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${new Date(t.data).toLocaleDateString()}</td>
                            <td>${t.nome}</td>
                            <td>${t.perfil}</td>
                            <td style="color:${t.type === 'entrada' ? 'green' : 'red'}">R$ ${t.valor.toFixed(2)}</td>
                            <td>${t.type === 'entrada' ? 'Entrada' : 'Saída'}</td>
                            <td>${t.fixoVariavel}</td>
                            <td>${t.parcelas}</td>
                        </tr>
                    `).join('')}
                    ${transactions.length === 0 ? '<tr><td colspan="7">Nenhuma transação cadastrada</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    container.innerHTML = html;
    
    if (canEdit) {
        document.getElementById('newTransactionBtn')?.addEventListener('click', () => {
            const form = document.getElementById('transactionForm');
            form.style.display = form.style.display === 'none' ? 'grid' : 'none';
        });
        document.getElementById('saveTransactionBtn')?.addEventListener('click', () => {
            const nome = document.getElementById('transName').value;
            const type = document.getElementById('transType').value;
            const valor = parseFloat(document.getElementById('transValue').value);
            const data = document.getElementById('transDate').value;
            const perfil = document.getElementById('transProfile').value;
            const fixoVariavel = document.getElementById('transFixed').value;
            const parcelas = parseInt(document.getElementById('transInstallments').value) || 1;
            const vencimento = document.getElementById('transDueDate').value;
            
            if (!nome || isNaN(valor) || !data) {
                alert('Preencha nome, valor e data');
                return;
            }
            
            const newTrans = {
                id: Date.now(),
                nome, type, valor, data, perfil, fixoVariavel, parcelas, vencimento
            };
            transactions.push(newTrans);
            saveTransactions();
            renderTransactions(container);
        });
    }
}

function renderCalendar(container) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Filtrar transações com vencimento no mês atual
    const monthTransactions = transactions.filter(t => {
        if (!t.vencimento) return false;
        const due = new Date(t.vencimento);
        return due.getMonth() === month && due.getFullYear() === year;
    });
    
    let html = `
        <div class="card">
            <h3>Calendário de Contas a Pagar/Receber - ${currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
            <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:8px; margin-top:20px;">
                ${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => `<div style="font-weight:bold; text-align:center;">${d}</div>`).join('')}
            </div>
            <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:8px;">
                ${Array.from({ length: new Date(year, month+1, 0).getDate() }, (_, i) => {
                    const day = i+1;
                    const hasEvent = monthTransactions.some(t => new Date(t.vencimento).getDate() === day);
                    return `<div style="border:1px solid #ddd; border-radius:8px; padding:8px; text-align:center; ${hasEvent ? 'background:#E8EFFF;' : ''}">
                                <strong>${day}</strong>
                                ${hasEvent ? '<br><i class="fas fa-circle" style="font-size:8px; color:var(--blue-primary);"></i>' : ''}
                            </div>`;
                }).join('')}
            </div>
        </div>
        <div class="card">
            <h3>Próximos Vencimentos</h3>
            <ul>
                ${monthTransactions.slice(0,10).map(t => `<li>${new Date(t.vencimento).toLocaleDateString()} - ${t.nome} - R$ ${t.valor.toFixed(2)} (${t.perfil})</li>`).join('')}
                ${monthTransactions.length === 0 ? '<li>Nenhum vencimento neste mês</li>' : ''}
            </ul>
        </div>
    `;
    container.innerHTML = html;
}

function renderSettings(container) {
    const trialEnd = new Date(currentUser.trialEndsAt);
    const daysLeft = Math.ceil((trialEnd - new Date()) / (1000*60*60*24));
    
    container.innerHTML = `
        <div class="card">
            <h3>Período de Teste</h3>
            <p>Seu teste gratuito termina em <strong>${daysLeft > 0 ? daysLeft : 0} dias</strong>.</p>
            <button id="cancelTrialBtn" class="btn-danger-sm" style="background:#DC2626; color:white; border:none; padding:8px16px; border-radius:8px;">Cancelar Assinatura</button>
        </div>
        <div class="card">
            <h3>Informações da Conta</h3>
            <p><strong>Nome:</strong> ${currentUser.name}</p>
            <p><strong>E-mail:</strong> ${currentUser.email}</p>
            <p><strong>Plano:</strong> ${currentUser.plan === 'familiar' ? 'Familiar / Pessoal' : 'Empresarial'}</p>
        </div>
    `;
    
    document.getElementById('cancelTrialBtn')?.addEventListener('click', () => {
        if (confirm('Tem certeza? Seu acesso será removido imediatamente.')) {
            logout();
            window.location.href = 'index.html';
        }
    });
}

// Navegação
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        renderCurrentPage();
    });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
});

// Inicializar
loadData();