
import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Products - UpdateById', () => {
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

  it('Shoud update a product', async () => {
    const res1 = await testServer.post('/products').set('authorization', 'Bearer ' + token!).send({name: 'Notebook'})

    const updateres = await testServer.put(`/products/${res1.body}`).set('authorization', 'Bearer ' + token!).send({name: 'Smartphone'})
      expect(updateres.statusCode).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to update a product with a short name', async () => {
    const res1 = await testServer.put('/products/1').set('authorization', 'Bearer ' + token!).send({name: 'Sm'})
      expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res1.body).toHaveProperty('errors.body.name')
  })
  it('Try to update a product with a negative id', async () => {
    const res1 = await testServer.put('/products/-1').set('authorization', 'Bearer ' + token!).send({name: 'Smartphone'})
      expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res1.body).toHaveProperty('errors.params.id')
  })
  
})