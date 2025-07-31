import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser, createProduct } from "../utils"

describe('Carts - GetItems', () => {
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
  it('Should get items from cart', async () => {
    const getItems = await testServer.get('/carts/items').set('authorization', `Bearer ${userToken}`).send()

    expect(getItems.status).toEqual(StatusCodes.CREATED)
    expect(getItems.body).toHaveLength(1)
    expect(Number(getItems.body[0].product_id)).toBe(productId)
  })
  it('Try to get items from cart without authorization', async () => {
    const getItems = await testServer.get('/carts/items').send()

    expect(getItems.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(getItems.body).toHaveProperty('errors.default')
  })
})