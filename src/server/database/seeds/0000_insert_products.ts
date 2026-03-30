import { Knex } from "knex";
import { EtableNames } from "../ETableNames";

const generateSpecifications = (
  productName: string,
): Record<string, string | number | boolean> => {
  const name = productName.toLowerCase();

  if (
    name.includes("laptop") ||
    name.includes("smartphone") ||
    name.includes("tv") ||
    name.includes("monitor") ||
    name.includes("speaker") ||
    name.includes("headphones")
  ) {
    return {
      voltage: "Bivolt",
      warranty_months: 12,
      is_smart: name.includes("smart"),
      connectivity:
        name.includes("bluetooth") || name.includes("wireless")
          ? "Wireless"
          : "Wired",
      brand: "GenericTech",
    };
  }

  // Cluster: Vestuário e Moda
  if (
    name.includes("shirt") ||
    name.includes("jeans") ||
    name.includes("shoes") ||
    name.includes("skirt") ||
    name.includes("dress") ||
    name.includes("sneakers")
  ) {
    return {
      size: ["S", "M", "L", "XL", "42"][Math.floor(Math.random() * 5)],
      material:
        name.includes("jeans") || name.includes("denim") ? "Denim" : "Cotton",
      color: ["Black", "White", "Navy Blue", "Grey"][
        Math.floor(Math.random() * 4)
      ],
      gender_target: name.includes("women")
        ? "Female"
        : name.includes("men")
          ? "Male"
          : "Unisex",
    };
  }

  // Cluster: Cosméticos e Higiene Pessoal
  if (
    name.includes("shampoo") ||
    name.includes("soap") ||
    name.includes("lotion") ||
    name.includes("mascara") ||
    name.includes("lipstick")
  ) {
    return {
      volume_ml: [150, 250, 400][Math.floor(Math.random() * 3)],
      hypoallergenic: true,
      dermatologically_tested: true,
      cruelty_free: true,
    };
  }

  // Cluster: Padrão (Fallback para os demais itens)
  return {
    weight_grams: Math.floor(Math.random() * 2000) + 100,
    origin: "National",
    fragile: name.includes("glass") || name.includes("mirror"),
  };
};

export const seed = async (knex: Knex) => {
  const [{ count: productCount }] = await knex(EtableNames.products).count<
    [{ count: number }]
  >("* as count");

  if (!Number(productCount)) {
    const productsToInsert = productNames.map((name) => ({
      name,
      description: "Sample description for testing purposes.",
      price: Number((Math.random() * 500 + 10).toFixed(2)),
      stock: Math.floor(Math.random() * 100) + 1,
      image_url: "https://via.placeholder.com/150",
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      specifications: JSON.stringify(generateSpecifications(name)),
    }));

    await knex.batchInsert(EtableNames.products, productsToInsert, 30);
  }
};

const productNames = [
  "Polo Shirt",
  "Gaming Laptop",
  "Coffee Beans",
  "Bluetooth Headphones",
  "Running Shoes",
  "Wireless Mouse",
  "Android Smartphone",
  "Hoodie Sweatshirt",
  "Digital Watch",
  "Portable Speaker",
  "Mechanical Keyboard",
  "24-Inch Monitor",
  "Blender",
  "Security Camera",
  "Men's Jeans",
  "Women's Dress Shirt",
  "Screwdriver",
  "Smart TV 50''",
  "Mountain Bike",
  "Cycling Helmet",
  "Cookware Set",
  "LED Desk Lamp",
  "Vacuum Cleaner",
  "Hypoallergenic Pillow",
  "Double Bed Comforter",
  "Gaming Chair",
  "External Hard Drive 1TB",
  "A4 Copy Paper",
  "Executive Backpack",
  "College Notebook",
  "Blue Ballpoint Pen",
  "All-in-One Printer",
  "Salted Butter",
  "Neutral Soap",
  "Anti-Dandruff Shampoo",
  "Moisturizing Conditioner",
  "Toothpaste",
  "Toothbrush",
  "Spray Deodorant",
  "Dish Soap",
  "Laundry Powder",
  "Fabric Softener",
  "Multi-Purpose Broom",
  "Aluminum Squeegee",
  "Plastic Bucket",
  "Pedal Trash Bin",
  "Wall Mirror",
  "Bath Towel",
  "Non-Slip Rug",
  "Stainless Soap Dish",
  "Table Fan",
  "Electric Drill",
  "Power Strip",
  "Single Switch",
  "Wall Outlet",
  "HDMI Cable 2m",
  "Surge Protector",
  "USB Flash Drive 32GB",
  "SD Card 64GB",
  "Portable Charger",
  "USB-C Charger",
  "Phone Holder",
  "Raincoat",
  "Automatic Umbrella",
  "Document Holder",
  "Leather Wallet",
  "Casual Sneakers",
  "Women's Sandals",
  "Men's Dress Shoes",
  "Cotton Socks",
  "Leather Belt",
  "Printed Cap",
  "Sunglasses",
  "Wired Earphones",
  "Men's Shorts",
  "Denim Skirt",
  "Maxi Dress",
  "Windbreaker Jacket",
  "Crossbody Bag",
  "Gold Necklace",
  "Silver Bracelet",
  "Hoop Earrings",
  "Analog Watch",
  "Liquid Foundation",
  "Matte Lipstick",
  "Compact Powder",
  "Waterproof Mascara",
  "Eyeshadow Palette",
  "Makeup Brush",
  "Red Nail Polish",
  "Makeup Remover",
  "Men's Cologne",
  "Women's Perfume",
  "Hand Sanitizer",
  "Disposable Gloves",
  "Face Mask",
  "Digital Thermometer",
  "First Aid Kit",
  "Multi-Purpose Scissors",
  "White Glue",
  "Mini Stapler",
  "Pencil Case",
  "Colored Pencils Set",
  "Felt Tip Markers",
  "Highlighter Pen",
  "Basic Calculator",
  "Plain T-Shirt",
  "Tank Top",
  "Sweatpants",
  "Rubber Flip-Flops",
  "Swim Shorts",
  "Infant Bodysuit",
  "Baby Jumpsuit",
  "Disposable Diapers",
  "Baby Wipes",
  "Silicone Teether",
  "Anti-Colic Baby Bottle",
  "Car Seat",
  "Baby Carrier",
  "Play Mat",
  "Portable Crib",
  "Baby Stroller",
  "Children's Bathrobe",
  "Educational Toy",
  "Building Blocks",
  "500-Piece Puzzle",
  "Memory Game",
  "Wooden Dominoes",
  "Card Game",
  "Soccer Ball",
  "Volleyball",
  "Tennis Racket",
  "Jump Rope",
  "Inline Skates",
  "Pro Skateboard",
  "Kids Helmet",
  "Shin Guards",
  "Shaker Bottle",
  "Whey Protein",
  "Granola Bar",
  "Thermal Bottle",
  "Insulated Lunch Bag",
  "Kitchen Knife",
  "Cutting Board",
  "Dish Towel",
  "Dish Rack",
  "Silicone Spatula",
  "Stainless Grater",
  "Rectangular Baking Pan",
  "Pressure Cooker",
  "Glassware Set",
  "Cutlery Set",
  "Dinner Plate",
  "Soup Plate",
  "Personalized Mug",
  "Bottle Opener",
  "Corkscrew",
  "Pizza Cutter",
  "Vegetable Chopper",
  "Airtight Container",
  "Glass Water Bottle",
  "Drawer Organizer",
  "Storage Box",
  "Wooden Hanger",
  "Liquid Soap Dispenser",
  "Shampoo Shelf",
  "Sink Trash Bin",
  "Toilet Brush",
  "Toilet Paper Holder",
  "Sink Plunger",
  "Foam Mop",
  "Electric Broom",
  "Spin Mop Bucket",
  "Detergent Dispenser",
  "Hand Towel",
  "Liquid Soap",
  "Kids Conditioner",
  "Body Lotion",
  "Massage Oil",
  "Home Spa Kit",
  "Fuzzy Slippers",
  "Microfiber Blanket",
  "Memory Foam Pillow",
  "Fitted Sheet",
  "Double Bed Sheet Set",
  "Queen Size Quilt",
  "Standing Fan",
  "Air Humidifier",
  "Bedside Lamp",
  "Ceiling Light",
  "RGB LED Strip",
  "Smart Plug",
  "Wi-Fi Switch",
  "Universal Remote",
  "Power Adapter",
  "Wireless Charger",
];
