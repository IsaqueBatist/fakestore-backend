import { testServer } from "../jest.setup";

export const createProduct = async (token: string) => {
  const product = await testServer.post('/products')
    .set('authorization', `Bearer ${token}`)
    .send({
      name: "Tênis Esportivo",
      description: "Tênis confortável para corrida e caminhada.",
      price: 199.90,
      image_url: "https://example.com/images/tenis-esportivo.jpg",
      rating: 4.5
    });
  return product.body;
};