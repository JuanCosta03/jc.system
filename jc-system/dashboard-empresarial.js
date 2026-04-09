// dashboard-empresarial.js - Sistema Empresarial estilo Power BI

let currentUser = null;
let employees = [];
let firedEmployees = [];
let products = [];
let sales = [];
let suppliers = [];
let taxConfig = { simplesNacional: 6, fgts: 8, inss: 11, rent: 2500 };
let companyName = "Minha Empresa";
let companyLogo = null;

// Carregar dados do localStorage
function loadData() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('empUserName').textContent = currentUser.name.split(' ')[0];
    
    // Carregar dados específicos da empresa
    const storedCompany = localStorage.getItem(`company_${currentUser.id}`);
    if (storedCompany) {
        const data = JSON.parse(storedCompany);
        employees = data.employees || [];
        firedEmployees = data.firedEmployees || [];
        products = data.products || [];
        sales = data.sales || [];
        suppliers = data.suppliers || [];
        taxConfig = data.taxConfig || taxConfig;
        companyName = data.companyName || companyName;
        companyLogo = data.companyLogo || null;
    } else {
        // Dados de exemplo
        employees = [
            { id: 1, name: "João Silva", cpf: "123.456.789-00", rg: "12.345.678-9", salary: 3000, active: true },
            { id: 2, name: "Maria Oliveira", cpf: "987.654.321-00", rg: "98.765.432-1", salary: 4500, active: true }
        ];
        products = [
            { id: 1, name: "Produto A", quantity: 50, price: 29.90 },
            { id: 2, name: "Produto B", quantity: 30, price: 49.90 }
        ];
        sales = [
            { id: 1, productName: "Produto A", quantity: 5, total: 149.50, date: "2025-03-01", seller: "João" },
            { id: 2, productName: "Produto B", quantity: 3, total: 149.70, date: "2025-03-02", seller: "Maria" }
        ];
        suppliers = [
            { id: 1, name: "Fornecedor X", cnpj: "12.345.678/0001-00", phone: "(11) 99999-9999" }
        ];
        saveCompanyData();
    }
    
    // Exibir splash screen por 5 segundos
    document.getElementById('companyNameDisplay').textContent = companyName;
    if (companyLogo) {
        document.getElementById('companyLogoDisplay').innerHTML = `<img src="${companyLogo}" style="width:80px; height:80px; object-fit:contain;">`;
    }
    setTimeout(() => {
        document.getElementById('splashScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('splashScreen').style.display = 'none';
            document.getElementById('dashboardMain').style.display = 'block';
        }, 500);
    }, 5000);
}

function saveCompanyData() {
    const data = {
        employees, firedEmployees, products, sales, suppliers,
        taxConfig, companyName, companyLogo
    };
    localStorage.setItem(`company_${currentUser.id}`, JSON.stringify(data));
}

// Renderização das abas
function renderTab(tabId) {
    const container = document.getElementById('tabContent');
    document.querySelectorAll('.nav-item-emp').forEach(nav => nav.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    switch(tabId) {
        case 'home': renderHome(container); break;
        case 'rh': renderRH(container); break;
        case 'estoque': renderEstoque(container); break;
        case 'vendas': renderVendas(container); break;
        case 'impostos': renderImpostos(container); break;
        case 'fornecedores': renderFornecedores(container); break;
        case 'config': renderConfig(container); break;
        default: renderHome(container);
    }
}

// Página inicial - Power BI style
function renderHome(container) {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalEmployees = employees.filter(e => e.active).length;
    const payroll = employees.filter(e => e.active).reduce((sum, e) => sum + e.salary, 0);
    const taxes = (totalSales * taxConfig.simplesNacional / 100) + (payroll * taxConfig.fgts / 100) + (payroll * taxConfig.inss / 100);
    const profit = totalSales - taxes - taxConfig.rent;
    
    const html = `
        <div class="kpi-grid">
            <div class="kpi-card"><h3>Faturamento Mensal</h3><div class="value">R$ ${totalSales.toFixed(2)}</div></div>
            <div class="kpi-card"><h3>Estoque Total</h3><div class="value">${totalProducts} unid.</div></div>
            <div class="kpi-card"><h3>Funcionários</h3><div class="value">${totalEmployees}</div></div>
            <div class="kpi-card"><h3>Lucro Estimado</h3><div class="value" style="color:green;">R$ ${profit.toFixed(2)}</div></div>
        </div>
        <div class="chart-container">
            <h3>Entradas vs Saídas (Mensal)</h3>
            <canvas id="cashFlowChart" height="100"></canvas>
        </div>
        <div class="chart-container">
            <h3>Projeção de Lucros (Próximos 6 meses)</h3>
            <canvas id="profitChart" height="100"></canvas>
        </div>
    `;
    container.innerHTML = html;
    
    // Gráficos
    const ctx1 = document.getElementById('cashFlowChart')?.getContext('2d');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], datasets: [
                { label: 'Entradas', data: [12000, 15000, 13500, 16000, 18000, 17500], backgroundColor: '#4CAF50' },
                { label: 'Saídas', data: [8000, 9000, 8500, 10000, 11000, 10500], backgroundColor: '#F44336' }
            ]}
        });
    }
    const ctx2 = document.getElementById('profitChart')?.getContext('2d');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'line',
            data: { labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6'], datasets: [{
                label: 'Lucro Projetado', data: [5200, 6000, 7200, 8500, 9100, 10200], borderColor: '#0000FF', fill: false
            }]}
        });
    }
}

// RH - Funcionários
function renderRH(container) {
    const activeEmployees = employees.filter(e => e.active);
    const html = `
        <div class="card" style="margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between;">
                <h3>Cadastrar Novo Funcionário</h3>
                <button id="addEmployeeBtn" class="btn-primary-emp">+ Novo</button>
            </div>
            <div id="employeeForm" style="display:none; margin-top:16px;" class="form-grid">
                <input type="text" id="empName" placeholder="Nome completo" class="form-input">
                <input type="text" id="empCpf" placeholder="CPF" class="form-input">
                <input type="text" id="empRg" placeholder="RG" class="form-input">
                <input type="number" id="empSalary" placeholder="Salário (R$)" class="form-input">
                <button id="saveEmployeeBtn" class="btn-primary-emp">Salvar</button>
            </div>
        </div>
        <div class="card">
            <h3>Funcionários Ativos</h3>
            <table><thead><tr><th>Nome</th><th>CPF</th><th>RG</th><th>Salário</th><th>Ações</th></tr></thead><tbody>
                ${activeEmployees.map(emp => `
                    <tr>
                        <td>${emp.name}</td><td>${emp.cpf}</td><td>${emp.rg}</td><td>R$ ${emp.salary}</td>
                        <td><button class="btn-danger-emp fire-btn" data-id="${emp.id}">Demitir</button></td>
                    </tr>
                `).join('')}
                ${activeEmployees.length === 0 ? '<tr><td colspan="5">Nenhum funcionário ativo</td></tr>' : ''}
            </tbody></table>
        </div>
        <div class="card">
            <h3>Funcionários Desligados</h3>
            <table><thead><tr><th>Nome</th><th>CPF</th><th>RG</th><th>Motivo</th></tr></thead><tbody>
                ${firedEmployees.map(emp => `<tr><td>${emp.name}</td><td>${emp.cpf}</td><td>${emp.rg}</td><td>Desligado</td></tr>`).join('')}
            </tbody></table>
        </div>
    `;
    container.innerHTML = html;
    
    document.getElementById('addEmployeeBtn')?.addEventListener('click', () => {
        const form = document.getElementById('employeeForm');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('saveEmployeeBtn')?.addEventListener('click', () => {
        const name = document.getElementById('empName').value;
        const cpf = document.getElementById('empCpf').value;
        const rg = document.getElementById('empRg').value;
        const salary = parseFloat(document.getElementById('empSalary').value);
        if (!name || !cpf || !rg || isNaN(salary)) return alert('Preencha todos os campos');
        const newId = Date.now();
        employees.push({ id: newId, name, cpf, rg, salary, active: true });
        saveCompanyData();
        renderRH(container);
    });
    document.querySelectorAll('.fire-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const emp = employees.find(e => e.id === id);
            if (emp && confirm(`Demitir ${emp.name}?`)) {
                emp.active = false;
                firedEmployees.push({ ...emp, firedAt: new Date().toISOString() });
                employees = employees.filter(e => e.id !== id);
                saveCompanyData();
                renderRH(container);
            }
        });
    });
}

// Estoque
function renderEstoque(container) {
    const html = `
        <div class="card" style="margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between;">
                <h3>Adicionar Produto</h3>
                <button id="addProductBtn" class="btn-primary-emp">+ Produto</button>
            </div>
            <div id="productForm" style="display:none; margin-top:16px;" class="form-grid">
                <input type="text" id="prodName" placeholder="Nome" class="form-input">
                <input type="number" id="prodQty" placeholder="Quantidade" class="form-input">
                <input type="number" id="prodPrice" placeholder="Preço (R$)" step="0.01" class="form-input">
                <button id="saveProductBtn" class="btn-primary-emp">Salvar</button>
            </div>
        </div>
        <div class="card">
            <h3>Produtos em Estoque</h3>
            <table><thead><tr><th>Produto</th><th>Quantidade</th><th>Preço</th><th>Ações</th></tr></thead><tbody>
                ${products.map(p => `
                    <tr><td>${p.name}</td><td>${p.quantity}</td><td>R$ ${p.price}</td>
                    <td><button class="btn-danger-emp delete-product" data-id="${p.id}">Excluir</button></td></tr>
                `).join('')}
            </tbody></table>
        </div>
    `;
    container.innerHTML = html;
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        document.getElementById('productForm').style.display = 'block';
    });
    document.getElementById('saveProductBtn')?.addEventListener('click', () => {
        const name = document.getElementById('prodName').value;
        const quantity = parseInt(document.getElementById('prodQty').value);
        const price = parseFloat(document.getElementById('prodPrice').value);
        if (!name || isNaN(quantity) || isNaN(price)) return alert('Preencha corretamente');
        products.push({ id: Date.now(), name, quantity, price });
        saveCompanyData();
        renderEstoque(container);
    });
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            products = products.filter(p => p.id !== id);
            saveCompanyData();
            renderEstoque(container);
        });
    });
}

// Ranking de Vendas
function renderVendas(container) {
    const ranking = sales.reduce((acc, sale) => {
        acc[sale.seller] = (acc[sale.seller] || 0) + sale.total;
        return acc;
    }, {});
    const sorted = Object.entries(ranking).sort((a,b) => b[1] - a[1]);
    const html = `
        <div class="card">
            <h3>Ranking de Vendedores</h3>
            <table><thead><tr><th>Vendedor</th><th>Total Vendido (R$)</th></tr></thead><tbody>
                ${sorted.map(([name, total]) => `<tr><td>${name}</td><td>R$ ${total.toFixed(2)}</td></tr>`).join('')}
                ${sorted.length === 0 ? '<tr><td colspan="2">Nenhuma venda registrada</td></tr>' : ''}
            </tbody></table>
        </div>
        <div class="card">
            <h3>Últimas Vendas</h3>
            <table><thead><tr><th>Data</th><th>Produto</th><th>Qtd</th><th>Total</th><th>Vendedor</th></tr></thead><tbody>
                ${sales.slice(-10).reverse().map(s => `
                    <tr><td>${s.date}</td><td>${s.productName}</td><td>${s.quantity}</td><td>R$ ${s.total}</td><td>${s.seller}</td></tr>
                `).join('')}
            </tbody></table>
        </div>
    `;
    container.innerHTML = html;
}

// Impostos e Custos Fixos
function renderImpostos(container) {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const payroll = employees.filter(e => e.active).reduce((sum, e) => sum + e.salary, 0);
    const calcTax = () => {
        const sn = totalSales * taxConfig.simplesNacional / 100;
        const fgts = payroll * taxConfig.fgts / 100;
        const inss = payroll * taxConfig.inss / 100;
        return { sn, fgts, inss, total: sn + fgts + inss + taxConfig.rent };
    };
    const taxes = calcTax();
    const html = `
        <div class="card">
            <h3>Configuração de Impostos e Custos</h3>
            <div class="form-grid" style="display:grid; gap:16px;">
                <div><label>Simples Nacional (%):</label><input type="number" id="taxSN" value="${taxConfig.simplesNacional}" step="0.1"></div>
                <div><label>FGTS (% sobre folha):</label><input type="number" id="taxFGTS" value="${taxConfig.fgts}" step="0.1"></div>
                <div><label>INSS (% sobre folha):</label><input type="number" id="taxINSS" value="${taxConfig.inss}" step="0.1"></div>
                <div><label>Aluguel (R$):</label><input type="number" id="taxRent" value="${taxConfig.rent}" step="100"></div>
                <button id="saveTaxBtn" class="btn-primary-emp">Salvar Configurações</button>
            </div>
        </div>
        <div class="card">
            <h3>Resumo Mensal de Impostos</h3>
            <p><strong>Simples Nacional:</strong> R$ ${taxes.sn.toFixed(2)}</p>
            <p><strong>FGTS:</strong> R$ ${taxes.fgts.toFixed(2)}</p>
            <p><strong>INSS:</strong> R$ ${taxes.inss.toFixed(2)}</p>
            <p><strong>Aluguel:</strong> R$ ${taxConfig.rent.toFixed(2)}</p>
            <p><strong>Total de Impostos + Custos Fixos:</strong> R$ ${taxes.total.toFixed(2)}</p>
        </div>
    `;
    container.innerHTML = html;
    document.getElementById('saveTaxBtn')?.addEventListener('click', () => {
        taxConfig.simplesNacional = parseFloat(document.getElementById('taxSN').value);
        taxConfig.fgts = parseFloat(document.getElementById('taxFGTS').value);
        taxConfig.inss = parseFloat(document.getElementById('taxINSS').value);
        taxConfig.rent = parseFloat(document.getElementById('taxRent').value);
        saveCompanyData();
        renderImpostos(container);
    });
}

// Fornecedores
function renderFornecedores(container) {
    const html = `
        <div class="card" style="margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between;">
                <h3>Cadastrar Fornecedor</h3>
                <button id="addSupplierBtn" class="btn-primary-emp">+ Novo</button>
            </div>
            <div id="supplierForm" style="display:none; margin-top:16px;" class="form-grid">
                <input type="text" id="supName" placeholder="Nome/Razão Social" class="form-input">
                <input type="text" id="supCnpj" placeholder="CNPJ" class="form-input">
                <input type="text" id="supPhone" placeholder="Telefone" class="form-input">
                <button id="saveSupplierBtn" class="btn-primary-emp">Salvar</button>
            </div>
        </div>
        <div class="card">
            <h3>Lista de Fornecedores</h3>
            <table><thead><tr><th>Nome</th><th>CNPJ</th><th>Telefone</th><th>Ações</th></tr></thead><tbody>
                ${suppliers.map(s => `
                    <tr><td>${s.name}</td><td>${s.cnpj}</td><td>${s.phone}</td>
                    <td><button class="btn-danger-emp delete-supplier" data-id="${s.id}">Excluir</button></td></tr>
                `).join('')}
            </tbody></table>
        </div>
    `;
    container.innerHTML = html;
    document.getElementById('addSupplierBtn')?.addEventListener('click', () => {
        document.getElementById('supplierForm').style.display = 'block';
    });
    document.getElementById('saveSupplierBtn')?.addEventListener('click', () => {
        const name = document.getElementById('supName').value;
        const cnpj = document.getElementById('supCnpj').value;
        const phone = document.getElementById('supPhone').value;
        if (!name) return alert('Nome é obrigatório');
        suppliers.push({ id: Date.now(), name, cnpj, phone });
        saveCompanyData();
        renderFornecedores(container);
    });
    document.querySelectorAll('.delete-supplier').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            suppliers = suppliers.filter(s => s.id !== id);
            saveCompanyData();
            renderFornecedores(container);
        });
    });
}

// Configurações da empresa
function renderConfig(container) {
    const html = `
        <div class="card">
            <h3>Configurações da Empresa</h3>
            <div class="form-grid">
                <div><label>Nome da Empresa:</label><input type="text" id="confCompanyName" value="${companyName}" class="form-input"></div>
                <div><label>Logo (URL da imagem):</label><input type="text" id="confLogoUrl" value="${companyLogo || ''}" placeholder="https://exemplo.com/logo.png" class="form-input"></div>
                <button id="saveConfigBtn" class="btn-primary-emp">Salvar Configurações</button>
            </div>
        </div>
    `;
    container.innerHTML = html;
    document.getElementById('saveConfigBtn')?.addEventListener('click', () => {
        companyName = document.getElementById('confCompanyName').value;
        companyLogo = document.getElementById('confLogoUrl').value || null;
        saveCompanyData();
        alert('Configurações salvas! Recarregue a página para ver o novo logo.');
    });
}

// Eventos de navegação
document.querySelectorAll('.nav-item-emp').forEach(nav => {
    nav.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = nav.dataset.tab;
        renderTab(tab);
    });
});
document.getElementById('logoutBtnEmp').addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
});

// Inicializar
loadData();
renderTab('home');