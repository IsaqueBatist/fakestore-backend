import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils/CreateAndLoginUser"

describe('Address - UpdateById',() => {
  let userToken: string = ''
  let userToken2: string = ''
  let addressId: number = 0
  beforeAll(async () => {
    const loginUser = await createAndLoginUser({
      name: 'Isaque Teste',
      email: 'isaqueteste@gmail.com',
      password_hash: 'senha123456'
    })
    userToken = loginUser.token

    const user2 = await createAndLoginUser({
      name: 'Isaque',
      email: 'isaque@gmail.com',
      password_hash: 'senha123456'
    })

    userToken2 = user2.token

    const newAddress = await testServer.post(`/addresses`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    addressId = newAddress.body
  })
  it('Should update a address', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Ameixas",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to update a address without street', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`).send({
      street: "",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.street")
  })
  it('Try to update a address without city', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.city")
  })
  it('Try to update a address without state', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.state")
  })
  it('Try to update a address without zip-code', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.zip_code")
  })
  it('Try to update a address without country', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: ""
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.country")
  })
  it('Try to update a address with an invalid zip-code', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-0",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.zip_code")
  })
  it('Try to update a address of another user', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).set('authorization', `Bearer ${userToken2}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.FORBIDDEN)
    expect(newAddresses.body).toHaveProperty("errors.default")
  })
  it('Try to update a address without authorization', async () => {
    const newAddresses = await testServer.put(`/addresses/${addressId}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-0",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(newAddresses.body).toHaveProperty("errors.default")
  })
})