import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils/CreateAndLoginUser"

describe('Address - GetById', () => {
  let userToken: string = ''
  let addressId: number = 0
  beforeAll(async () => {
    const loginUser = await createAndLoginUser({
      name: 'Isaque Teste',
      email: 'isaqueteste@gmail.com',
      password_hash: 'senha123456'
    })
    userToken = loginUser.token

    const newAddresses = await testServer.post(`/addresses`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    addressId = newAddresses.body
  })
  
  it('Should get a address by id', async () => {
    const address = await testServer.get(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`).send()

    expect(address.status).toEqual(StatusCodes.OK)
    expect(address.body).toHaveProperty('street')
  })
  it('Try to get a non-existing address', async () => {
    const address = await testServer.get(`/addresses/9999`).set('authorization', `Bearer ${userToken}`).send()

    expect(address.status).toEqual(StatusCodes.NOT_FOUND)
    expect(address.body).toHaveProperty('errors.default')
  })
  it('Try to get a address without authorization', async () => {
    const address = await testServer.get(`/addresses/${addressId}`).send()

    expect(address.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(address.body).toHaveProperty('errors.default')
  })
})