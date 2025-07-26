import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils/CreateAndLoginUser"

describe('Address - GetAll', () => {
  let userToken: string = ''
  beforeAll(async () => {
    const loginUser = await createAndLoginUser({
      name: 'Isaque Teste',
      email: 'isaqueteste@gmail.com',
      password_hash: 'senha123456'
    })
    userToken = loginUser.token
  })
  it('Should get all addresses', async () => {
    const addresses = await testServer.get('/addresses').set('authorization', `Bearer ${userToken}`).send()

    expect(addresses.status).toEqual(StatusCodes.OK)
    expect(addresses.body.length).toBeGreaterThanOrEqual(0)
  })
  it('Try to get all addresses without authorization', async () => {
    const addresses = await testServer.get('/addresses').set('authorization', `Bearer ${userToken}`).send()

    expect(addresses.status).toEqual(StatusCodes.OK)
    expect(addresses.body.length).toBeGreaterThanOrEqual(0)
  })
})