const request = require('supertest');
const fs = require('fs');
const app = require('./app'); // assuming app.js exports the app instance

jest.mock('fs'); // Mocking fs module

const DATA_FILE = 'tasks.json';

describe('Task API', () => {
    beforeEach(() => {
        fs.existsSync.mockImplementation((path) => path === DATA_FILE);
        fs.readFileSync.mockImplementation(() => JSON.stringify([]));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /tasks - should return an empty array', async () => {
        const response = await request(app).get('/tasks');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('POST /tasks - should create a new task', async () => {
        fs.readFileSync.mockImplementationOnce(() => JSON.stringify([])); // Simulate empty file
        const newTask = { title: 'New Task' };
        const response = await request(app).post('/tasks').send(newTask);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newTask.title);
    });

    test('PUT /tasks/:id - should update an existing task', async () => {
        const existingTask = [{ id: 1, title: 'Old Task', completed: false }];
        fs.readFileSync.mockImplementationOnce(() => JSON.stringify(existingTask));
        const updatedTask = { title: 'Updated Task', completed: true };
        const response = await request(app).put('/tasks/1').send(updatedTask);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updatedTask.title);
        expect(response.body.completed).toBe(updatedTask.completed);
    });

    test('PUT /tasks/:id - should return 404 for non-existing task', async () => {
        fs.readFileSync.mockImplementationOnce(() => JSON.stringify([])); // Simulate empty file
        const response = await request(app).put('/tasks/999').send({ title: 'Non-existing Task' });
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });

    test('DELETE /tasks/:id - should delete an existing task', async () => {
        const existingTasks = [{ id: 1, title: 'Task to delete' }];
        fs.readFileSync.mockImplementationOnce(() => JSON.stringify(existingTasks));
        const response = await request(app).delete('/tasks/1');
        expect(response.status).toBe(204);
    });

    test('DELETE /tasks/:id - should return 404 for non-existing task', async () => {
        const existingTasks = [{ id: 1, title: 'Task' }];
        fs.readFileSync.mockImplementationOnce(() => JSON.stringify(existingTasks));
        const response = await request(app).delete('/tasks/999');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });
});
