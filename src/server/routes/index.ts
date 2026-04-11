import { Router } from "express";
import { authRouter } from "./auth.routes";
import { productsRouter } from "./products.routes";
import { categoriesRouter } from "./categories.routes";
import { ordersRouter } from "./orders.routes";
import { cartsRouter } from "./carts.routes";
import { addressesRouter } from "./addresses.routes";
import { favoritesRouter } from "./favorites.routes";
import { tenantsRouter } from "./tenants.routes";
import { analyticsRouter } from "./analytics.routes";
import { webhooksRouter } from "./webhooks.routes";
import { aiRouter } from "./ai.routes";
import { uploadsRouter } from "./uploads.routes";
import { shippingRouter } from "./shipping.routes";
import { couponsRouter } from "./coupons.routes";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticação e recuperação de senha
 *   - name: Products
 *     description: Gerenciamento de produtos
 *   - name: Categories
 *     description: Categorias
 *   - name: Comments
 *     description: Comentários
 *   - name: Orders
 *     description: Pedidos
 *   - name: Cart
 *     description: Carrinho
 *   - name: Addresses
 *     description: Endereços
 *   - name: Favorites
 *     description: Favoritos
 *   - name: AI
 *     description: Assistente de IA para integração com a API (SDK Dinâmico)
 *   - name: Analytics
 *     description: Métricas e analytics do tenant
 *   - name: Webhooks
 *     description: Gerenciamento de webhooks
 *   - name: Uploads
 *     description: Upload de imagens via presigned URLs
 *   - name: Shipping
 *     description: Cotação de frete e rastreamento (Melhor Envio)
 *   - name: Coupons
 *     description: Sistema de cupons e descontos
 *   - name: Tenants
 *     description: Operações do tenant
 */

const router = Router();

// Routers that keep full paths (e.g., /login, /products, /categories)
// are mounted directly on /v1
router.use("/v1", authRouter);
router.use("/v1", productsRouter);
router.use("/v1", categoriesRouter);
router.use("/v1", analyticsRouter);

// Routers that use relative paths (e.g., /, /:id)
// are mounted on /v1/<domain>
router.use("/v1/orders", ordersRouter);
router.use("/v1/carts", cartsRouter);
router.use("/v1/addresses", addressesRouter);
router.use("/v1/favorites", favoritesRouter);
router.use("/v1/tenants", tenantsRouter);
router.use("/v1/webhooks", webhooksRouter);
router.use("/v1/ai", aiRouter);
router.use("/v1/uploads", uploadsRouter);
router.use("/v1/shipping", shippingRouter);
router.use("/v1", couponsRouter);

export { router };
