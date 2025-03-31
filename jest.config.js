module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    transform: {
        '^.+\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
};