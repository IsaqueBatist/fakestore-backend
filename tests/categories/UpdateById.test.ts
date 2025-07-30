import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Categories - UpdateById', () => {
  let adminToken: string  = ''
  let categoryId: number = 0
  beforeAll(async () => {
    const admin = await testServer.post('/login').send({
      email: 'admin@exemple.com',
      password_hash: 'adminSenha123'
    })

    adminToken = admin.body.accessToken

    const newCategory = await testServer.post('/categories').set('authorization', `Bearer ${adminToken}`).send({
      name: "Categoria Teste",
      description: "Categoria Teste"
    })
    categoryId = newCategory.body
  })
  
  it('Should update a category', async () => {
    const updateCategory = await testServer.put(`/categories/${categoryId}`).set('authorization', `Bearer ${adminToken}`).send({
      name: 'Categoria Atualizada',
      description: 'Descrição atualizada'
    })
    expect(updateCategory.status).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to update a category with short name', async () => {
    const newCategory = await testServer.put(`/categories/${categoryId}`).set('authorization', `Bearer ${adminToken}`).send({
      name: "Te",
      description: "Categoria Atualizada"
    })

    expect(newCategory.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newCategory.body).toHaveProperty("errors.body.name")
  })
  it('Try to update a category without name', async () => {
    const newCategory = await testServer.put(`/categories/${categoryId}`).set('authorization', `Bearer ${adminToken}`).send({
      name: "",
      description: "Categoria Atualizada"
    })

    expect(newCategory.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newCategory.body).toHaveProperty("errors.body.name")
  })
  it('Try to update a category without description', async () => {
    const newCategory = await testServer.put(`/categories/${categoryId}`).set('authorization', `Bearer ${adminToken}`).send({
      name: "Categoria Teste",
      description: ""
    })

    expect(newCategory.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(newCategory.body).toHaveProperty("errors.body.description")
  })
  it('Try to update a category without authorization', async () => {
    const newCategory = await testServer.put(`/categories/${categoryId}`).send({
      name: "Categoria Teste",
      description: ""
    })

    expect(newCategory.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(newCategory.body).toHaveProperty("errors.default")
  })
})