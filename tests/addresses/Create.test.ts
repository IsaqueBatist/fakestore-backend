import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils/CreateAndLoginUser"

describe('Address - Create',() => {
  let userToken: string = ''
  beforeAll(async () => {
    const loginUser = await createAndLoginUser({
      name: 'Isaque Teste',
      email: 'isaqueteste@gmail.com',
      password_hash: 'senha123456'
    })
    userToken = loginUser.token
  })
  it('Should create a address', async () => {
    const newAddresses = await testServer.post('/addresses').set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.CREATED)
    expect(typeof newAddresses.body).toEqual("number")
  })
  it('Try to create a address without street', async () => {
    const newAddresses = await testServer.post('/addresses').set('authorization', `Bearer ${userToken}`).send({
      street: "",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.street")
  })
  it('Try to create a address without city', async () => {
    const newAddresses = await testServer.post('/addresses').set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "",
      state: "SP",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.city")
  })
  it('Try to create a address without state', async () => {
    const newAddresses = await testServer.post('/addresses').set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "",
      zip_code: "12900-000",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.state")
  })
  it('Try to create a address without zip-code', async () => {
    const newAddresses = await testServer.post('/addresses').set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.zip_code")
  })
  it('Try to create a address without country', async () => {
    const newAddresses = await testServer.post('/addresses').set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-000",
      country: ""
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.country")
  })
  it('Try to create a address with an invalid zip-code', async () => {
    const newAddresses = await testServer.post('/addresses').set('authorization', `Bearer ${userToken}`).send({
      street: "Rua das Flores",
      city: "Bragança Paulista",
      state: "SP",
      zip_code: "12900-0",
      country: "Brasil"
    })
    expect(newAddresses.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newAddresses.body).toHaveProperty("errors.body.zip_code")
  })
  it('Try to create a address without authorization', async () => {
    const newAddresses = await testServer.post('/addresses').send({
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