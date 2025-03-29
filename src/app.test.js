const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./app'); // assuming app.js exports the app

const DATA_FILE = path.join(__dirname, 'tasks.json');

// Cleanup the tasks.json file before running tests
beforeAll(() => {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
});

afterAll(() => {
    fs.unlinkSync(DATA_FILE); // Remove the tasks file after tests
});

describe('Tasks API', () => {
    test('GET /tasks - should return an array of tasks', async () => {
        const response = await request(app).get('/tasks');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /tasks - should create a new task', async () => {
        const newTask = { title: 'Test Task' };
        const response = await request(app)
            .post('/tasks')
            .send(newTask);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newTask.title);
    });

    test('PUT /tasks/:id - should update an existing task', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({ title: 'Task to update' });
        const taskId = createResponse.body.id;

        const updatedTask = { title: 'Updated Task' };
        const response = await request(app)
            .put(`/tasks/${taskId}`)
            .send(updatedTask);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(updatedTask.title);
    });

    test('DELETE /tasks/:id - should delete a task', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({ title: 'Task to delete' });
        const taskId = createResponse.body.id;

        const response = await request(app)
            .delete(`/tasks/${taskId}`);
        expect(response.statusCode).toBe(204);

        const checkResponse = await request(app).get('/tasks');
        expect(checkResponse.body).not.toContainEqual(expect.objectContaining({ id: taskId }));
    });

    test('PUT /tasks/:id - should return 404 if task not found', async () => {
        const response = await request(app)
            .put('/tasks/999999')
            .send({ title: 'Non-existent Task' });
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error', 'Task not found');
    });

    test('DELETE /tasks/:id - should return 404 if task not found', async () => {
        const response = await request(app)
            .delete('/tasks/999999');
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error', 'Task not found');
    });
});