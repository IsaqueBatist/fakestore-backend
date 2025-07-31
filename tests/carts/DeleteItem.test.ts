import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser, createProduct } from "../utils"

describe('Carts - DeleteItem', () => { 
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

  it('Should delete an item from cart', async () => {
    const deleteItem = await testServer.delete(`/carts/items/${productId}`).set('authorization', `Bearer ${userToken}`).send()

    expect(deleteItem.status).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to delete a non-existing item from cart', async () => {
    const deleteItem = await testServer.delete(`/carts/items/${productId}`).set('authorization', `Bearer ${userToken}`).send()

    expect(deleteItem.status).toEqual(StatusCodes.NOT_FOUND)
    expect(deleteItem.body).toHaveProperty('errors.default')
  })
  it('Try to delete an item from cart without authorization', async () => {
    const deleteItem = await testServer.delete(`/carts/items/${productId}`).send()

    expect(deleteItem.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(deleteItem.body).toHaveProperty('errors.default')
  })

})