import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils/CreateAndLoginUser"

describe('Address - DeleteById',() => {
  let userToken: string = ''
  let userToken2: string = ''
  let addressId: number = 0
  let addressId2: number = 0
  beforeAll(async () => {
    const loginUser = await createAndLoginUser({
      name: 'Isaque Teste',
      email: 'isaqueteste@gmail.com',
      password_hash: 'senha123456'
    })

    const user2 = await createAndLoginUser({
      name: 'Isaque',
      email: 'isaque@gmail.com',
      password_hash: 'senha123456'
    })

    userToken = loginUser.token
    userToken2 = user2.token
    //Create Address
    const newAddresses = await testServer.post(`/addresses`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    addressId = newAddresses.body
    const newAddresses2 = await testServer.post(`/addresses`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    addressId2 = newAddresses2.body

  })

  it('Should delete a address', async () => {
    const newAddresses = await testServer.delete(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`)
    
    expect(newAddresses.status).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to delete a non-existing address', async () => {
    const newAddresses = await testServer.delete(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`)
    
    expect(newAddresses.status).toEqual(StatusCodes.NOT_FOUND)
    expect(newAddresses.body).toHaveProperty("errors.default")
  })
  it('Try to delete a address of other user', async () => {
    const newAddresses = await testServer.delete(`/addresses/${addressId2}`).set('authorization', `Bearer ${userToken2}`)
    
    expect(newAddresses.status).toEqual(StatusCodes.FORBIDDEN)
    expect(newAddresses.body).toHaveProperty("errors.default")
  })
  it('Try to create a address without authorization', async () => {
    const newAddresses = await testServer.delete(`/addresses/${addressId}`).send()

    expect(newAddresses.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(newAddresses.body).toHaveProperty("errors.default")
  })
})