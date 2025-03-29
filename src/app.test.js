const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./app'); // Assuming app.js exports the app

const DATA_FILE = path.join(__dirname, 'tasks.json');

// Clean up the tasks.json before running tests
beforeAll(() => {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
});

afterAll(() => {
    if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
    }
});

describe('Task API', () => {
    it('should create a new task', async () => {
        const response = await request(app)
            .post('/tasks')
            .send({ title: 'Test Task' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Test Task');
    });

    it('should retrieve all tasks', async () => {
        await request(app)
            .post('/tasks')
            .send({ title: 'Task 1' });

        const response = await request(app).get('/tasks');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty('title', 'Task 1');
    });

    it('should update a task', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({ title: 'Task to be updated' });

        const taskId = createResponse.body.id;

        const response = await request(app)
            .put(`/tasks/${taskId}`)
            .send({ title: 'Updated Task' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('title', 'Updated Task');
    });

    it('should delete a task', async () => {
        const createResponse = await request(app)
            .post('/tasks')
            .send({ title: 'Task to be deleted' });

        const taskId = createResponse.body.id;

        const response = await request(app)
            .delete(`/tasks/${taskId}`);

        expect(response.status).toBe(204);

        // Verify task deletion
        const getResponse = await request(app).get('/tasks');
        expect(getResponse.body.length).toBe(0);
    });

    it('should return 404 for a non-existent task', async () => {
        const response = await request(app).put('/tasks/99999').send({ title: 'Non-existent Task' });
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Task not found');
    });
});
