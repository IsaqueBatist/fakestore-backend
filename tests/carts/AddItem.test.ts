import { StatusCodes } from 'http-status-codes'
import { testServer } from '../jest.setup'
import {createAndLoginUser} from '../utils/CreateAndLoginUser'
import {createProduct} from '../utils/CreateProduct'

describe('Carts - AddItem', () => {
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
  })
  
  it("Should add item to user's cart", async () => {
    const addItem = await testServer.post('/carts/items').set('authorization', `Bearer ${userToken}`).send({
      product_id: productId,
      quantity: 2
    })
    expect(addItem.status).toEqual(StatusCodes.CREATED)
    expect(typeof addItem.body).toEqual("number")
  })
  it('Try to add an item with invalid product Id', async () => {
    const addItem = await testServer.post('/carts/items').set('authorization', `Bearer ${userToken}`).send({
      product_id: productId+1,
      quantity: 2
    })
    expect(addItem.status).toEqual(StatusCodes.NOT_FOUND)
    expect(addItem.body).toHaveProperty("errors.default")
  })
  it('Try to add an item with invalid quantity', async () => {
    const addItem = await testServer.post('/carts/items').set('authorization', `Bearer ${userToken}`).send({
      product_id: productId,
      quantity: 0
    })
    expect(addItem.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(addItem.body).toHaveProperty("errors.body.quantity")
  })
  it('Try to add an item without product Id', async () => {
    const addItem = await testServer.post('/carts/items').set('authorization', `Bearer ${userToken}`).send({
      quantity: 0
    })
    expect(addItem.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(addItem.body).toHaveProperty("errors.body.product_id")
  })
  it('Try to add an item without quantity', async () => {
    const addItem = await testServer.post('/carts/items').set('authorization', `Bearer ${userToken}`).send({
      product_id: productId
    })
    expect(addItem.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(addItem.body).toHaveProperty("errors.body.quantity")
  })
  it('Try to add an item without authorization', async () => {
    const addItem = await testServer.post('/carts/items').send({
      product_id: productId,
      quantity: 2
    })
    expect(addItem.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(addItem.body).toHaveProperty("errors.default")
  })
})