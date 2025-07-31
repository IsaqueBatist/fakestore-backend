import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createProduct, createAndLoginUser } from "../utils"

describe('Carts - CleanCart', () => {
  let userToken: string = ''
  let productId: number = 0
  beforeAll(async () => {
    const admin = await testServer.post('/login').send({
      email: 'admin@exemple.com',
      password_hash: 'adminSenha123'
    })
    const user = await createAndLoginUser({
      name: 'Usuário teste',
      email: 'teste@exemple.com',
      password_hash: '123456'
    })
    userToken = user.token
    productId = await createProduct(admin.body.accessToken)

    await testServer.post('/carts/items').set('authorization', `Bearer ${userToken}`).send({
      product_id: productId,
      quantity: 2
    })
  })
  it('Should clean cart', async () => {
    const cleanCart = await testServer.delete('/carts').set('authorization', `Bearer ${userToken}`).send()

    expect(cleanCart.status).toBe(StatusCodes.NO_CONTENT)
  })
  it('Try to clean a empty cart', async () => {
    const cleanCart = await testServer.delete('/carts').set('authorization', `Bearer ${userToken}`).send()

    expect(cleanCart.status).toBe(StatusCodes.NOT_FOUND)
    expect(cleanCart.body).toHaveProperty('errors.default')
  })
  it('Try to clean a cart without authorization', async () => {
    const cleanCart = await testServer.delete('/carts').send()

    expect(cleanCart.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(cleanCart.body).toHaveProperty('errors.default')
  })
})