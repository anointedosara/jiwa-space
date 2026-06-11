import { ObjectId } from "mongodb";
import type { Doc } from "./store";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

// Stable ids so seeded references line up between memory + mongo runs.
const ids = {
  avanzel: "650000000000000000000001",
  avenzel: "650000000000000000000002",
  cipayung: "650000000000000000000003",
  pondok: "650000000000000000000004",
  oCibubur: "650000000000000000000005",
  cassablanca: "650000000000000000000006",
  songgoroti: "650000000000000000000007",
  groundPalace: "650000000000000000000008",
};

export type Space = {
  _id: ObjectId;
  name: string;
  type: "Hotel" | "Apartment" | "Villa" | "Guest House";
  location: string;
  area: string;
  city: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  badge?: string;
  hostName: string;
  hostLogo: string;
  description: string;
  images: string[];
  amenities: string[];
  popular: boolean;
};

function spaces(): Space[] {
  return [
    {
      _id: new ObjectId(ids.avanzel),
      name: "Avanzel Hotel",
      type: "Hotel",
      location: "Pondok Gede, East Jakarta",
      area: "Pondok Gede",
      city: "East Jakarta",
      price: 1101030,
      currency: "Rp",
      rating: 4.9,
      reviews: 15,
      guests: 2,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      badge: "Hot",
      hostName: "Avanzel Hotel Cibubur",
      hostLogo: img("1611892440504-42a792e24d32", 200),
      description:
        "Twin Bed Special Room In Avanzel Hotel. A bright, modern room with a private bath, a relaxed living corner and easy access to the city. Stay with ease, live relaxed.",
      images: [
        img("1566073771259-6a8506099945"),
        img("1582719478250-c89cae4dc85b"),
        img("1631049307264-da0ec9d70304"),
      ],
      amenities: ["Wifi", "Pool", "Air conditioning", "Breakfast", "Parking"],
      popular: true,
    },
    {
      _id: new ObjectId(ids.avenzel),
      name: "Avenzel Hotel Cibubur",
      type: "Hotel",
      location: "Cibubur, West Java, Indonesia",
      area: "Cibubur",
      city: "West Java",
      price: 1101030,
      currency: "Rp",
      rating: 4.9,
      reviews: 15,
      guests: 2,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      hostName: "Avenzel Hotel Cibubur",
      hostLogo: img("1564501049412-61c2a3083791", 200),
      description:
        "Twin Bed Special Room In Avenzel Hotel. 2 Guests · 1 bedroom · 2 beds · 1 private bath. A calm space to unwind after a day exploring the city.",
      images: [
        img("1551882547-ff40c63fe5fa"),
        img("1578683010236-d716f9a3f461"),
        img("1590490360182-c33d57733427"),
      ],
      amenities: ["Wifi", "Pool", "Gym", "Air conditioning", "Parking"],
      popular: true,
    },
    {
      _id: new ObjectId(ids.cipayung),
      name: "Apartment in Cipayung",
      type: "Apartment",
      location: "Cipayung, East Jakarta",
      area: "Cipayung",
      city: "East Jakarta",
      price: 801530,
      currency: "Rp",
      rating: 4.95,
      reviews: 22,
      guests: 3,
      bedrooms: 2,
      beds: 2,
      baths: 1,
      hostName: "Cipayung Living",
      hostLogo: img("1521737604893-d14cc237f11d", 200),
      description:
        "A modern apartment near East Jakarta with a sparkling pool view, fast wifi and a fully equipped kitchen. Perfect for a longer stay.",
      images: [
        img("1512917774080-9991f1c4c750"),
        img("1502672260266-1c1ef2d93688"),
        img("1560448204-e02f11c3d0e2"),
      ],
      amenities: ["Wifi", "Pool", "Kitchen", "Washer", "Parking"],
      popular: true,
    },
    {
      _id: new ObjectId(ids.pondok),
      name: "Apartment in Pondok Gede",
      type: "Apartment",
      location: "Pondok Gede, East Jakarta",
      area: "Pondok Gede",
      city: "East Jakarta",
      price: 966401,
      currency: "Rp",
      rating: 4.89,
      reviews: 18,
      guests: 5,
      bedrooms: 3,
      beds: 3,
      baths: 2,
      hostName: "Pondok Stays",
      hostLogo: img("1556157382-97eda2d62296", 200),
      description:
        "Spacious apartment in Pondok Gede for up to 5 guests. Floor-to-ceiling windows, a bright living area and a calm neighbourhood.",
      images: [
        img("1505691938895-1758d7feb511"),
        img("1522708323590-d24dbb6b0267"),
        img("1493809842364-78817add7ffb"),
      ],
      amenities: ["Wifi", "Kitchen", "Air conditioning", "Elevator", "Parking"],
      popular: false,
    },
    {
      _id: new ObjectId(ids.oCibubur),
      name: "Hotel O Cibubur",
      type: "Hotel",
      location: "Cibubur, West Java, Indonesia",
      area: "Cibubur",
      city: "West Java",
      price: 920352,
      currency: "Rp",
      rating: 4.89,
      reviews: 31,
      guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      hostName: "Hotel O",
      hostLogo: img("1542314831-068cd1dbfeeb", 200),
      description:
        "Comfortable rooms at Hotel O Cibubur with a warm welcome, fresh breakfast and great rates.",
      images: [
        img("1564501049412-61c2a3083791"),
        img("1611892440504-42a792e24d32"),
        img("1618773928121-c32242e63f39"),
      ],
      amenities: ["Wifi", "Breakfast", "Air conditioning", "Parking"],
      popular: false,
    },
    {
      _id: new ObjectId(ids.cassablanca),
      name: "Cassablanca Ground",
      type: "Villa",
      location: "Sawojajar Street 90, Malang",
      area: "Sawojajar",
      city: "Malang",
      price: 750000,
      currency: "Rp",
      rating: 4.7,
      reviews: 12,
      guests: 6,
      bedrooms: 3,
      beds: 4,
      baths: 2,
      hostName: "Cassablanca Villas",
      hostLogo: img("1568605114967-8130f3a36994", 200),
      description:
        "A ground villa in Malang with a private garden and plenty of room for the whole group.",
      images: [
        img("1613490493576-7fde63acd811"),
        img("1600585154340-be6161a56a0c"),
        img("1600566753086-00f18fb6b3ea"),
      ],
      amenities: ["Wifi", "Garden", "Kitchen", "Parking", "BBQ"],
      popular: false,
    },
    {
      _id: new ObjectId(ids.songgoroti),
      name: "Songgoroti Villa",
      type: "Villa",
      location: "Songgoroti Street 68, Malang",
      area: "Songgoroti",
      city: "Malang",
      price: 980000,
      currency: "Rp",
      rating: 4.8,
      reviews: 19,
      guests: 8,
      bedrooms: 4,
      beds: 5,
      baths: 3,
      hostName: "Songgoroti Retreat",
      hostLogo: img("1564013799919-ab600027ffc6", 200),
      description:
        "A mountain villa with a fireplace, hot spring access and sweeping valley views.",
      images: [
        img("1600607687939-ce8a6c25118c"),
        img("1600047509807-ba8f99d2cdde"),
        img("1600121848594-d8644e57abab"),
      ],
      amenities: ["Wifi", "Hot spring", "Fireplace", "Kitchen", "Parking"],
      popular: false,
    },
    {
      _id: new ObjectId(ids.groundPalace),
      name: "The Ground Palace",
      type: "Guest House",
      location: "Merdeka Selatan Street 3, Malang",
      area: "Merdeka Selatan",
      city: "Malang",
      price: 640000,
      currency: "Rp",
      rating: 4.6,
      reviews: 9,
      guests: 4,
      bedrooms: 2,
      beds: 3,
      baths: 1,
      hostName: "Ground Palace",
      hostLogo: img("1551038247-3d9af20df552", 200),
      description:
        "A cosy guest house in central Malang, steps from the square and the best local food.",
      images: [
        img("1631049552240-59c37f38802b"),
        img("1505693416388-ac5ce068fe85"),
        img("1560185007-cde436f6a4d0"),
      ],
      amenities: ["Wifi", "Breakfast", "Air conditioning"],
      popular: false,
    },
    ...moreSpaces(),
  ];
}

// Image pools, default amenities and host logos for the generated catalog.
const POOL: Record<string, string[]> = {
  hotel: [
    "1566073771259-6a8506099945",
    "1551882547-ff40c63fe5fa",
    "1564501049412-61c2a3083791",
    "1542314831-068cd1dbfeeb",
    "1618773928121-c32242e63f39",
    "1582719478250-c89cae4dc85b",
    "1611892440504-42a792e24d32",
  ],
  apartment: [
    "1512917774080-9991f1c4c750",
    "1502672260266-1c1ef2d93688",
    "1560448204-e02f11c3d0e2",
    "1505691938895-1758d7feb511",
    "1522708323590-d24dbb6b0267",
    "1493809842364-78817add7ffb",
  ],
  villa: [
    "1613490493576-7fde63acd811",
    "1600585154340-be6161a56a0c",
    "1600566753086-00f18fb6b3ea",
    "1600607687939-ce8a6c25118c",
    "1600047509807-ba8f99d2cdde",
    "1571003123894-1f0594d2b5d9",
  ],
  guest: [
    "1631049552240-59c37f38802b",
    "1505693416388-ac5ce068fe85",
    "1560185007-cde436f6a4d0",
    "1551038247-3d9af20df552",
    "1522771739844-6a9f6d5f14af",
  ],
};
const AMEN: Record<string, string[]> = {
  hotel: ["Wifi", "Pool", "Breakfast", "Air conditioning", "Parking"],
  apartment: ["Wifi", "Kitchen", "Washer", "Air conditioning", "Elevator"],
  villa: ["Wifi", "Pool", "Garden", "Kitchen", "Parking"],
  guest: ["Wifi", "Breakfast", "Air conditioning"],
};
const LOGOS = [
  "1611892440504-42a792e24d32",
  "1564501049412-61c2a3083791",
  "1542314831-068cd1dbfeeb",
  "1556157382-97eda2d62296",
  "1521737604893-d14cc237f11d",
  "1568605114967-8130f3a36994",
  "1564013799919-ab600027ffc6",
  "1551038247-3d9af20df552",
];

type Seedling = {
  name: string;
  type: Space["type"];
  pool: keyof typeof POOL;
  area: string;
  city: string;
  price: number;
  rating: number;
  reviews: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  popular?: boolean;
  badge?: string;
};

function moreSpaces(): Space[] {
  const data: Seedling[] = [
    { name: "Grand Mercure Suite", type: "Hotel", pool: "hotel", area: "Menteng", city: "Central Jakarta", price: 1350000, rating: 4.92, reviews: 41, guests: 2, bedrooms: 1, beds: 1, baths: 1, popular: true, badge: "Hot" },
    { name: "The Hermitage Loft", type: "Apartment", pool: "apartment", area: "Kebayoran", city: "South Jakarta", price: 980000, rating: 4.88, reviews: 27, guests: 3, bedrooms: 2, beds: 2, baths: 1, popular: true },
    { name: "Seminyak Beach Villa", type: "Villa", pool: "villa", area: "Seminyak", city: "Bali", price: 2450000, rating: 4.97, reviews: 63, guests: 8, bedrooms: 4, beds: 5, baths: 3, popular: true, badge: "Hot" },
    { name: "Ubud Jungle Retreat", type: "Villa", pool: "villa", area: "Ubud", city: "Bali", price: 1890000, rating: 4.95, reviews: 52, guests: 6, bedrooms: 3, beds: 4, baths: 2, popular: true },
    { name: "Canggu Surf House", type: "Guest House", pool: "guest", area: "Canggu", city: "Bali", price: 760000, rating: 4.82, reviews: 34, guests: 4, bedrooms: 2, beds: 3, baths: 2, popular: true },
    { name: "Dago Heights Apartment", type: "Apartment", pool: "apartment", area: "Dago", city: "Bandung", price: 870000, rating: 4.86, reviews: 19, guests: 4, bedrooms: 2, beds: 2, baths: 1, popular: true },
    { name: "Malioboro Stay", type: "Guest House", pool: "guest", area: "Malioboro", city: "Yogyakarta", price: 540000, rating: 4.74, reviews: 22, guests: 3, bedrooms: 1, beds: 2, baths: 1 },
    { name: "Bekasi City Suites", type: "Hotel", pool: "hotel", area: "Bekasi Kota", city: "Bekasi", price: 690000, rating: 4.7, reviews: 16, guests: 2, bedrooms: 1, beds: 2, baths: 1 },
    { name: "Depok Green Apartment", type: "Apartment", pool: "apartment", area: "Margonda", city: "Depok", price: 720000, rating: 4.84, reviews: 25, guests: 3, bedrooms: 2, beds: 2, baths: 1, popular: true },
    { name: "Sentul Hillside Villa", type: "Villa", pool: "villa", area: "Sentul", city: "Bogor", price: 1450000, rating: 4.9, reviews: 38, guests: 7, bedrooms: 3, beds: 4, baths: 2 },
    { name: "Kemang Boutique Hotel", type: "Hotel", pool: "hotel", area: "Kemang", city: "South Jakarta", price: 1120000, rating: 4.89, reviews: 44, guests: 2, bedrooms: 1, beds: 1, baths: 1, popular: true },
    { name: "Cibubur Garden House", type: "Guest House", pool: "guest", area: "Cibubur", city: "West Java", price: 650000, rating: 4.78, reviews: 14, guests: 5, bedrooms: 3, beds: 3, baths: 2 },
  ];

  return data.map((d, i) => {
    const pool = POOL[d.pool];
    const images = [0, 1, 2].map((k) => img(pool[(i + k) % pool.length]));
    return {
      _id: new ObjectId(`6500000000000000000000${(9 + i).toString(16).padStart(2, "0")}`),
      name: d.name,
      type: d.type,
      location: `${d.area}, ${d.city}`,
      area: d.area,
      city: d.city,
      price: d.price,
      currency: "Rp",
      rating: d.rating,
      reviews: d.reviews,
      guests: d.guests,
      bedrooms: d.bedrooms,
      beds: d.beds,
      baths: d.baths,
      badge: d.badge,
      hostName: d.name,
      hostLogo: img(LOGOS[i % LOGOS.length], 200),
      description: `${d.name} — a ${d.type.toLowerCase()} in ${d.area}, ${d.city}. ${d.guests} Guests · ${d.bedrooms} bedroom · ${d.beds} beds · ${d.baths} private bath. Stay with ease, live relaxed, and search with Jiva.`,
      images,
      amenities: AMEN[d.pool],
      popular: d.popular ?? false,
    };
  });
}

const avatar = (id: string) => img(id, 160);

/**
 * Chat contacts (the people you can message). Conversations are materialized
 * per-user and start empty; see /api/chats. Sending a message bumps that
 * conversation to the top of the list.
 */
export const CHAT_CONTACTS = [
  { name: "Mike Prasetyo", avatar: avatar("1500648767791-00dcc994a43e") },
  { name: "John Ravello", avatar: avatar("1535713875002-d1d0cf377fde") },
  { name: "Michael Rahman", avatar: avatar("1506794778202-cad84cf45f1d") },
  { name: "Kevin Abdullah", avatar: avatar("1502685104226-ee32379fefbe") },
  { name: "Kenzie Williams", avatar: avatar("1507003211169-0a1dd7228f2d") },
  { name: "Sarah Lestari", avatar: avatar("1438761681033-6461ffad8d80") },
];

// Notifications are per-user and generated at runtime as people log in and use
// the app (see lib/notify.ts), so the catalog ships with none.

// Generic interior shots used to give every space a fuller photo gallery
// on the detail page (target: 6 images each).
const GALLERY = [
  "1556228453-efd6c1ff04f6",
  "1484101403633-562f891dc89a",
  "1522444195799-478538b28823",
  "1502005229762-cf1b2da7c5d6",
  "1583847268964-b28dc8f51f92",
  "1540518614846-7eded433c457",
  "1554995207-c18c203602cb",
  "1616137466211-f939a420be84",
  "1616594039964-ae9021a400a0",
  "1617104678098-de229db51175",
  "1505693416388-ac5ce068fe85",
  "1493809842364-78817add7ffb",
];

/** Convert the catalog's base figures into realistic Naira nightly rates. */
function toNaira(base: number): number {
  return Math.round(base / 13 / 500) * 500;
}

function padImages(list: Space[]): Space[] {
  const extras = GALLERY.map((id) => img(id));
  return list.map((s, i) => {
    const start = (i * 3) % extras.length;
    const rotated = [...extras.slice(start), ...extras.slice(0, start)];
    const merged = [...s.images];
    for (const url of rotated) {
      if (merged.length >= 6) break;
      if (!merged.includes(url)) merged.push(url);
    }
    return { ...s, images: merged, price: toNaira(s.price), currency: "₦" };
  });
}

export function seedData(): Record<string, Doc[]> {
  return {
    spaces: padImages(spaces()) as unknown as Doc[],
    chats: [],
    notifications: [],
    users: [],
    bookings: [],
  };
}
