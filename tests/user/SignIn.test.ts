import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('User - signIn', () => {
    beforeAll(async () => {
        await testServer.post('/register').send({
            name: 'Isaque Test',
            email: 'isaqueTest@exemple.com',
            password_hash: '1234567'
        })
    })
    it('Should login user', async () => {
        const login = await testServer.post('/login').send({
            email: 'isaqueTest@exemple.com',
            password_hash: '1234567'
        })

        expect(login.statusCode).toEqual(StatusCodes.OK)
        expect(login.body).toHaveProperty('accessToken')
    })
    it('Try to login with a wrong email', async () => {
        const login = await testServer.post('/login').send({
            email: 'isaqueTestWrong@exemple.com',
            password_hash: '1234567'
        })
        expect(login.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(login.body).toHaveProperty('errors.default')
    })
    it('Try to login with a wrong password', async () => {
        const login = await testServer.post('/login').send({
            email: 'isaqueTest@exemple.com',
            password_hash: '12345678'
        })
        expect(login.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(login.body).toHaveProperty('errors.default')
    })
    it('Try to login with a an invalid email', async () => {
        const login = await testServer.post('/login').send({
            email: 'isaqueTest',
            password_hash: '1234567'
        })
        expect(login.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(login.body).toHaveProperty('errors.body.email')
    })
    it('Try to login with a an invalid password', async () => {
        const login = await testServer.post('/login').send({
            email: 'isaqueTest@exemple.com',
            password_hash: '123'
        })
        expect(login.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(login.body).toHaveProperty('errors.body.password_hash')
    })
})