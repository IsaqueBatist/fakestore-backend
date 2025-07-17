import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";

describe('Products - deleteById', () => {
  let token: string | undefined = undefined
  beforeAll(async () => {
    //Create user
    await testServer.post('/register').send({
            firstName: 'Isaque',
            lastName: 'Test',
            email: 'isaque.test@exemple.com',
            password: '1234567'
    })

    //Get token
    const newToken = await testServer.post('/login').send({
      email: 'isaque.test@exemple.com',
      password: '1234567'
    })

    token = newToken.body.accessToken
  })

  it('Should delete a register', async () => {
    const res1 = await testServer.post('/products').set('authorization', 'Bearer ' + token!).send({ name: 'Notebook' })
    expect(res1.statusCode).toEqual(StatusCodes.CREATED)

    const resApagado = await testServer.delete(`/products/${res1.body}`).set('authorization', 'Bearer ' + token!).send();

    expect(resApagado.statusCode).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to delete a register with an invalid id', async () => {
    const res1 = await testServer.delete('/products/-1').set('authorization', 'Bearer ' + token!).send()

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.params.id')
  })
})