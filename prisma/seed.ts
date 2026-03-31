import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const materials = [
  { name: "珍珠", slug: "pearl" },
  { name: "贝母", slug: "mother-of-pearl" },
  { name: "纯银", slug: "sterling-silver" },
  { name: "锆石", slug: "zircon" },
];

const products = [
  {
    name: "月光珍珠胸针",
    description:
      "天然淡水珍珠搭配镀金底座，月牙造型优雅灵动。适合日常通勤与正式场合佩戴。",
    price: 28800,
    imageUrl: "/images/products/pearl-moonlight.jpg",
    materialSlug: "pearl",
  },
  {
    name: "珍珠花束胸针",
    description:
      "三颗大小不一的淡水珍珠组成花束造型，搭配锆石点缀叶片，精致温婉。",
    price: 35800,
    imageUrl: "/images/products/pearl-bouquet.jpg",
    materialSlug: "pearl",
  },
  {
    name: "贝母蝴蝶胸针",
    description:
      "天然白贝母切割打磨成蝴蝶翅膀，光泽细腻。每枚因天然纹理不同而独一无二。",
    price: 22800,
    imageUrl: "/images/products/mop-butterfly.jpg",
    materialSlug: "mother-of-pearl",
  },
  {
    name: "贝母山茶花胸针",
    description: "多层贝母花瓣层叠构成山茶花造型，中心点缀锆石花蕊，经典永恒。",
    price: 31800,
    imageUrl: "/images/products/mop-camellia.jpg",
    materialSlug: "mother-of-pearl",
  },
  {
    name: "纯银羽毛胸针",
    description:
      "925 纯银手工锻造羽毛造型，纹理细腻自然。表面做旧处理增添复古气质。",
    price: 19800,
    imageUrl: "/images/products/silver-feather.jpg",
    materialSlug: "sterling-silver",
  },
  {
    name: "纯银猫咪胸针",
    description:
      "925 纯银打造慵懒猫咪剪影，简约线条勾勒灵动身姿。适合猫咪爱好者。",
    price: 16800,
    imageUrl: "/images/products/silver-cat.jpg",
    materialSlug: "sterling-silver",
  },
  {
    name: "锆石星辰胸针",
    description:
      "密镶施华洛世奇锆石组成星辰图案，光芒璀璨。适合晚宴等隆重场合。",
    price: 42800,
    imageUrl: "/images/products/zircon-stars.jpg",
    materialSlug: "zircon",
  },
  {
    name: "锆石蜻蜓胸针",
    description: "翅膀镶嵌渐变色锆石，身体以合金铸造，灵动飞舞姿态定格于胸前。",
    price: 38800,
    imageUrl: "/images/products/zircon-dragonfly.jpg",
    materialSlug: "zircon",
  },
  {
    name: "珍珠蜜蜂胸针",
    description:
      "圆润珍珠为蜜蜂身躯，翅膀以透明锆石点缀，活泼俏皮的日常百搭款。",
    price: 25800,
    imageUrl: "/images/products/pearl-bee.jpg",
    materialSlug: "pearl",
  },
  {
    name: "珍珠玫瑰胸针",
    description:
      "五片天然淡水珍珠层叠排列成玫瑰花瓣，中心以金色花蕊收尾，浪漫典雅，婚礼场合首选。",
    price: 31200,
    imageUrl: "/images/products/pearl-rose.jpg",
    materialSlug: "pearl",
  },
  {
    name: "珍珠流苏胸针",
    description:
      "三串细腻小珍珠自别针垂落，轻盈晃动间尽显灵动感。适合搭配西装翻领或针织外套。",
    price: 27500,
    imageUrl: "/images/products/pearl-tassel.jpg",
    materialSlug: "pearl",
  },
  {
    name: "珍珠星月胸针",
    description:
      "新月托举圆润珍珠，925 银镀金底座勾勒星月轮廓，点缀微镶锆石，清新而不失精致。",
    price: 19900,
    imageUrl: "/images/products/pearl-starmoon.jpg",
    materialSlug: "pearl",
  },
  {
    name: "纯银枫叶胸针",
    description: "925 纯银蚀刻枫叶脉络，叶面微微卷曲呈现立体感。秋季限定设计。",
    price: 21800,
    imageUrl: "/images/products/silver-maple.jpg",
    materialSlug: "sterling-silver",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert materials
  const materialMap = new Map<string, string>();
  for (const m of materials) {
    const record = await prisma.material.upsert({
      where: { slug: m.slug },
      update: { name: m.name },
      create: m,
    });
    materialMap.set(m.slug, record.id);
  }
  console.log(`  ✅ ${materials.length} materials`);

  // Reset and recreate products (safe for seed data)
  await prisma.product.deleteMany();
  for (const p of products) {
    const materialId = materialMap.get(p.materialSlug)!;
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        materialId,
      },
    });
  }
  console.log(`  ✅ ${products.length} products`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
