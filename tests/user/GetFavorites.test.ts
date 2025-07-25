import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup";
import { createAndLoginUser } from "../utils/CreateAndLoginUser";

describe('User - get Favorites', () => {
    let userToken = '';

    beforeAll(async () => {
      const adminToken = await testServer.post('/login').send({
        email: 'admin@exemple.com',
        password_hash: 'adminSenha123'
      })
      //Criar produto 1
      const newProduct1 = await testServer.post('/products').set('authorization', `Bearer ${adminToken.body.accessToken}`).send({
        name: "Tênis Esportivo",
        description: "Tênis confortável para corrida e caminhada.",
        price: 199.90,
        image_url: "https://example.com/images/tenis-esportivo.jpg",
        rating: 4.5
      })
      //Criar produto 1
      const newProduct2 = await testServer.post('/products').set('authorization', `Bearer ${adminToken.body.accessToken}`).send({
        name: "Tênis Esportivo",
        description: "Tênis confortável para corrida e caminhada.",
        price: 199.90,
        image_url: "https://example.com/images/tenis-esportivo.jpg",
        rating: 4.5
      })
      const loginUser = await createAndLoginUser({
        name: 'Isaque Teste',
        email: 'isaqueteste@gmail.com',
        password_hash: 'senha123456'
      })
      userToken = loginUser.token
      //Adcionar ao favorite
      await testServer.post('/favorites').set('authorization', `Bearer ${userToken}`).send({
        product_id: newProduct1.body
      })
      await testServer.post('/favorites').set('authorization', `Bearer ${userToken}`).send({
        product_id: newProduct2.body
      })
    })
    it('Should get all favorites', async () => {
      const favorites = await testServer.get('/favorites').set('authorization', `Bearer ${userToken}`).send()

      expect(favorites.status).toEqual(StatusCodes.OK)
      expect(favorites.body.length).toBeGreaterThan(0)
    })
    it('Try to get all favorites without authorization', async () => {
      const favorites = await testServer.get('/favorites').send()

      expect(favorites.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(favorites.body).toHaveProperty('errors.default')
    })
})