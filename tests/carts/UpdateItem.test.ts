import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser, createProduct } from "../utils"

describe('Carts - UpdateItem', () => { 
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
  it('Should update an item from cart', async () => {
    const updateItem = await testServer.put(`/carts/items/${productId}`).set('authorization', `Bearer ${userToken}`).send({
      quantity: 3
    })

    expect(updateItem.status).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to update an item from cart with negative quantity', async () => {
    const updateItem = await testServer.put(`/carts/items/${productId}`).set('authorization', `Bearer ${userToken}`).send({
      quantity: -1
    })

    expect(updateItem.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(updateItem.body).toHaveProperty('errors.body.quantity')
  })
  it('Try to update an item from cart without quantity', async () => {
    const updateItem = await testServer.put(`/carts/items/${productId}`).set('authorization', `Bearer ${userToken}`).send({
      
    })

    expect(updateItem.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(updateItem.body).toHaveProperty('errors.body.quantity')
  })
})