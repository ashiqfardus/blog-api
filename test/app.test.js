import request from "supertest";
import app from "../app";
describe("Test user registration route", ()=>{
    test('Should have success and data with token when created', async ()=>{
        const res = await request(app).post('/api/v1/auth/register').send({
            "firstname":"Ashiq",
            "lastname": "Fardus",
            "email":"ashiq1112@gmail.com",
            "password":"123456"
        });

        expect(res.body).toHaveProperty("success")
        expect(res.body).toHaveProperty("data")
    });
});

