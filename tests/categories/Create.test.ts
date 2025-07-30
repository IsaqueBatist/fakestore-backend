import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Categories - Craete', () => {
  let adminToken: string = ''
  beforeAll(async () => {
    const admin = await testServer.post('/login').send({
      email: 'admin@exemple.com',
      password_hash: 'adminSenha123'
    })
    adminToken = admin.body.accessToken
  })
  it('Should create a category', async () => {
    const newCategory = await testServer.post('/categories').set('authorization', `Bearer ${adminToken}`).send({
      name: "Categoria Teste",
      description: "Categoria feita para testar"
    })

    expect(newCategory.status).toEqual(StatusCodes.CREATED)
    expect(typeof newCategory.body).toEqual("number")
  })
  it('Try to create a category with short name', async () => {
    const newCategory = await testServer.post('/categories').set('authorization', `Bearer ${adminToken}`).send({
      name: "Te",
      description: "Categoria feita para testar"
    })

    expect(newCategory.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newCategory.body).toHaveProperty("errors.body.name")
  })
  it('Try to create a category without name', async () => {
    const newCategory = await testServer.post('/categories').set('authorization', `Bearer ${adminToken}`).send({
      name: "",
      description: "Categoria feita para testar"
    })

    expect(newCategory.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newCategory.body).toHaveProperty("errors.body.name")
  })
  it('Try to create a category without description', async () => {
    const newCategory = await testServer.post('/categories').set('authorization', `Bearer ${adminToken}`).send({
      name: "Categoria Teste",
      description: ""
    })

    expect(newCategory.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newCategory.body).toHaveProperty("errors.body.description")
  })
  it('Try to create a category without authorization', async () => {
    const newCategory = await testServer.post('/categories').send({
      name: "Categoria Teste",
      description: ""
    })

    expect(newCategory.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(newCategory.body).toHaveProperty("errors.default")
  })
})