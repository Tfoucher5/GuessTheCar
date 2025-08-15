// Configuration Jest pour les tests
require('dotenv').config({ path: '.env.test' });

// Mock des modules externes si nécessaire
jest.mock('../src/shared/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

// Configuration globale des timeouts
jest.setTimeout(10000);

// Nettoyage après chaque test
afterEach(() => {
    jest.clearAllMocks();
});