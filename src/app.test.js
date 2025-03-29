const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./app');

const DATA_FILE = path.join(__dirname, 'tasks.json');

// Cleanup function to reset the tasks.json file before each test
const resetTasksFile = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
};

beforeEach(resetTasksFile);

afterAll(() => {
    // Close any active connections if necessary (e.g., database connections)
});

describe('Task API', () => {
    it('should get all tasks', async () => {
        const response = await request(app).get('/tasks');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should add a new task', async () => {
        const newTask = { title: 'Test Task' };
        const response = await request(app)
            .post('/tasks')
            .send(newTask);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newTask.title);
    });

    it('should update a task', async () => {
        const newTask = { title: 'Task to Update' };
        const addResponse = await request(app)
            .post('/tasks')
            .send(newTask);
        const taskId = addResponse.body.id;

        const updatedTask = { title: 'Updated Task' };
        const updateResponse = await request(app)
            .put(`/tasks/${taskId}`)
            .send(updatedTask);
        expect(updateResponse.statusCode).toBe(200);
        expect(updateResponse.body.title).toBe(updatedTask.title);
    });

    it('should delete a task', async () => {
        const newTask = { title: 'Task to Delete' };
        const addResponse = await request(app)
            .post('/tasks')
            .send(newTask);
        const taskId = addResponse.body.id;

        const deleteResponse = await request(app)
            .delete(`/tasks/${taskId}`);
        expect(deleteResponse.statusCode).toBe(204);

        const getResponse = await request(app).get('/tasks');
        expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 when task not found for update', async () => {
        const updateResponse = await request(app)
            .put('/tasks/999999')
            .send({ title: 'Non-existent Task' });
        expect(updateResponse.statusCode).toBe(404);
    });

    it('should return 404 when task not found for delete', async () => {
        const deleteResponse = await request(app)
            .delete('/tasks/999999');
        expect(deleteResponse.statusCode).toBe(404);
    });
});