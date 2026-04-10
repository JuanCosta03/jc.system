// auth.js - Sistema de autenticação
const USERS_KEY = 'jcsystem_users';
const CURRENT_USER_KEY = 'jcsystem_current_user';

function initUsers() {
    let users = localStorage.getItem(USERS_KEY);
    if (!users) {
        // Conta pessoal do Juan (familiar)
        // Contas de teste (para simular primeiro acesso - sem dados)
        const testUsers = [
            {
                id: '1',
                name: 'Juan Costa',
                email: 'jc.system@hotmil.com',
                password: 'Adm@123',
                plan: 'familiar',
                planPrice: '14.99',
                trialEndsAt: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
                hasData: false
            },
            {
                id: '2',
                name: 'Família Teste',
                email: 'familia@jcsystem.com',
                password: 'familia123',
                plan: 'familiar',
                planPrice: '14.99',
                trialEndsAt: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
                hasData: false
            },
            {
                id: '3',
                name: 'Empresa Teste',
                email: 'empresa@jcsystem.com',
                password: 'familia123',
                plan: 'empresarial',
                planPrice: '350',
                trialEndsAt: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
                hasData: false
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(testUsers));
    }
}

function login(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
    }
    return null;
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

function register(email, password, fullname, plan, price) {
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find(u => u.email === email)) return null;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    const newUser = {
        id: Date.now().toString(),
        name: fullname,
        email,
        password,
        plan,
        planPrice: price,
        trialEndsAt: trialEndsAt.toISOString(),
        hasData: false
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
}

function userHasData(userId) {
    const profiles = localStorage.getItem(`profiles_${userId}`);
    const transactions = localStorage.getItem(`transactions_${userId}`);
    return (profiles && JSON.parse(profiles).length > 0) || (transactions && JSON.parse(transactions).length > 0);
}

initUsers();
// Exportar para uso global
window.getCurrentUser = getCurrentUser;
window.login = login;
window.logout = logout;
window.register = register;
window.userHasData = userHasData;
