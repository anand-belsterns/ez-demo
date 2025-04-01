const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./app'); // Adjust import based on how app.js exports the app

const DATA_FILE = path.join(__dirname, 'tasks.json');

// Clear the tasks.json file before each test
beforeEach(() => {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
});

// Close the server after all tests
afterAll(done => {
    // Perform any necessary cleanup, like closing database connections
    done();
});

describe('Task API', () => {
    it('should fetch all tasks', async () => {
        const response = await request(app).get('/tasks');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should create a new task', async () => {
        const newTask = { title: 'Test task' };
        const response = await request(app).post('/tasks').send(newTask);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newTask.title);
    });

    it('should update an existing task', async () => {
        const newTask = { title: 'Task to update' };
        const createResponse = await request(app).post('/tasks').send(newTask);
        const taskId = createResponse.body.id;

        const updatedTask = { title: 'Updated task' };
        const updateResponse = await request(app).put(`/tasks/${taskId}`).send(updatedTask);
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.title).toBe(updatedTask.title);
    });

    it('should return 404 for updating a non-existent task', async () => {
        const response = await request(app).put('/tasks/999999').send({ title: 'Non-existent task' });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Task not found' });
    });

    it('should delete a task', async () => {
        const newTask = { title: 'Task to delete' };
        const createResponse = await request(app).post('/tasks').send(newTask);
        const taskId = createResponse.body.id;

        const deleteResponse = await request(app).delete(`/tasks/${taskId}`);
        expect(deleteResponse.status).toBe(204);

        const fetchResponse = await request(app).get('/tasks');
        expect(fetchResponse.body).toEqual([]);
    });

    it('should return 404 for deleting a non-existent task', async () => {
        const response = await request(app).delete('/tasks/999999');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Task not found' });
    });
});
