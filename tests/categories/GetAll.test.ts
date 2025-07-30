import { StatusCodes } from "http-status-codes"
import { ICategory } from "../../src/server/database/models"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils/CreateAndLoginUser"

describe('Categories - GetAll', () => {
  beforeAll(async () => {
    const admin = await testServer.post('/login').send({
      email: 'admin@exemple.com',
      password_hash: 'adminSenha123'
    })

    //Adicionar categorias
    await testServer.post('/categories').set('authorization', `Bearer ${admin.body.accessToken}`).send({
      name: "Categoria Teste 1",
      description: "Categoria feita para testar"
    })
    await testServer.post('/categories').set('authorization', `Bearer ${admin.body.accessToken}`).send({
      name: "Categoria Teste 2",
      description: "Categoria feita para testar"
    })
    await testServer.post('/categories').set('authorization', `Bearer ${admin.body.accessToken}`).send({
      name: "Categoria Teste 3",
      description: "Categoria feita para testar"
    })
  })

  it('Should getAll categories', async () => {
    const getAll = await testServer.get('/categories').send()

    expect(getAll.status).toEqual(StatusCodes.OK)
    expect(getAll.body.length).toBeGreaterThan(0)
    expect(Number(getAll.headers['x-total-count'])).toBeGreaterThan(0)
  })
  it('Try to get all categories with negative page', async () => {
    const getAll = await testServer.get('/categories?page=-1').send()

    expect(getAll.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(getAll.body).toHaveProperty('errors.query.page')
  })
  it('Try to get all categories with negative limit', async () => {
    const getAll = await testServer.get('/categories?limit=-1').send()

    expect(getAll.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(getAll.body).toHaveProperty('errors.query.limit')
  })
})
