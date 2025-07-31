import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils"

describe('Carts - GetByUserId', () => { 
  let userToken: string = ''
  let userId: number = -
  beforeAll(async () => {
    const user = await createAndLoginUser({
      name: 'Usuário teste',
      email: 'teste@exemple.com',
      password_hash: '123456'
    })
    userToken = user.token
    userId = user.userId
  })
  it('Should get user cart', async () => {
    const userCart = await testServer.get('/carts').set('authorization', `Bearer ${userToken}`).send()

    expect(userCart.status).toEqual(StatusCodes.OK)
    expect(userCart.body).toHaveProperty('id_cart')
    expect(Number(userCart.body.user_id)).toEqual(userId)
  })
  it('Try to get a cart without authorization', async () => {
    const userCart = await testServer.get('/carts').send()

    expect(userCart.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(userCart.body).toHaveProperty('errors.default')
  })
})