module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\.jsx?$': 'babel-jest',
    },
    testRegex: '(/__tests__/.*|(\.|/)(test|spec))\.jsx?$',
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};