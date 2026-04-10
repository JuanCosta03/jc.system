// auth.js - Com logs para depuração
const USERS_KEY = 'jcsystem_users';
const CURRENT_USER_KEY = 'jcsystem_current_user';

function initUsers() {
    let users = localStorage.getItem(USERS_KEY);
    if (!users) {
        const testUsers = [
            {
                id: '1',
                name: 'Família Exemplo',
                email: 'familia@jcsystem.com',
                password: 'familia123',
                plan: 'familiar',
                planPrice: '14.99',
                trialEndsAt: new Date(Date.now() + 30*24*60*60*1000).toISOString()
            },
            {
                id: '2',
                name: 'Empresa Exemplo',
                email: 'empresa@jcsystem.com',
                password: 'familia123',
                plan: 'empresarial',
                planPrice: '350',
                trialEndsAt: new Date(Date.now() + 30*24*60*60*1000).toISOString()
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(testUsers));
        console.log('✅ Usuários de teste criados no localStorage');
    } else {
        console.log('✅ Usuários já existem no localStorage');
    }
}

function login(email, password) {
    console.log('🔍 Tentando login com:', email);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        console.log('✅ Login bem-sucedido. Usuário salvo:', user.email, 'Plano:', user.plan);
        return user;
    } else {
        console.log('❌ Falha no login. Credenciais inválidas.');
        return null;
    }
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    console.log('👋 Logout realizado');
}

function getCurrentUser() {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (userStr) {
        const user = JSON.parse(userStr);
        console.log('📌 Usuário atual obtido:', user.email, 'Plano:', user.plan);
        return user;
    } else {
        console.log('⚠️ Nenhum usuário logado no localStorage');
        return null;
    }
}

function register(email, password, fullname, plan, price) {
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find(u => u.email === email)) return null;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    const newUser = {
        id: Date.now().toString(),
        name: fullname,
        email, password, plan, planPrice: price,
        trialEndsAt: trialEndsAt.toISOString()
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
}

initUsers();
