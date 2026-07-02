export const ENTITIES_RAW = {
  users: 1,
  productCategories: 25,
  products: 26,
  orders: 27,
  orderItems: 28,
  clients: 29,
  news: 30,
  prices: 31,
  productSubCategory: 36,
  tradeMarks: 37,
  shoeSizes: 38,
};

export const FIELDS_RAW = {
  users: {
    tgID: 299,
  },
  clients: {
    fullName: 265,
    ruPhoneNumber: 266,
    email: 267,
    address: 269,
    password: 271,
    companyName: 272,
    status: 273,
    inn: 276,
    tgID: 281,
    tgNick: 303,
    personalDiscount: 338,
  },
  news: {
    text: 295,
    img: 296,
    url: 297,
    publishDate: 301, // FIXME: MISSING!
  },
  products: {
    photo: 220,
    article: 221,
    boxSize: 222,
    inStock: 223,
    category: 225,
    description: 274,
    review: 275,
    isNew: 277,
    status: 278,
    otherPhotos: 288,
    recomendedMinimalSize: 306,
    recomendedMinimalSizeBoxParts: 315,
    keywords: 319,
    tax: 370,
    packageSize: 383,
    color: 388,
    finalPriceServiced: 401,
    modelName: 423,
    tradeMark: 425,
    textColor: 433,
    shoeSize: 434,
    price: 435,
    discountedPrice: 437,
    producingCountry: 439,
    minKidAge: 442,
    maxKidAge: 443,
    kidGender: 444,
    subCategory: 456,
    rutubeReview: 461,
  },
  productCategories: {
    name: 213,
  },
  orders: {
    title: 234,
    client: 235,
    paymentMethod: 279,
    deliveryMethod: 280,
    phoneNumber: 283,
    email: 284,
    address: 285,
    companyName: 286,
    inn: 287,
    taxedAmount: 327,
    status: 337,
    personalDiscount: 341,
    amount: 368,
    comment: 369,
  },
  orderItems: {
    product: 242,
    quantity: 245,
    price: 246,
    boxesCount: 248,
    boxSize: 249,
    category: 250,
    recomendedMinimalSize: 305,
    tax: 363,
    taxedPrice: 364,
    amount: 366,
    packageSize: 385,
    article: 399,
  },
  prices: {
    price: 313,
    isCurrent: 314,
    discount: 321,
    discountedPrice: 322,
    article: 373,
    code: 374,
  },
  productSubCategory: {
    name: 422,
  },
  tradeMarks: {
    name: 436,
    about: 458,
    logo: 459,
  },
  shoeSizes: {
    length: 451,
    ruSize: 452,
    euSize: 453,
    cls: 454,
    name: 455,
  },
};

export const AgeEnum: Record<number, number> = {
  56: 0,
  57: 1,
  58: 2,
  59: 3,
  60: 4,
  61: 5,
  62: 6,
  63: 7,
  64: 8,
  65: 9,
  66: 10,
  67: 11,
  68: 12,
};

export const VALUES = {
  clients: {
    status: {
      active: 68,
    },
  },
  products: {
    status: {
      active: 70,
      inactive: 71,
    },
    producingCountry: {
      china: 53,
      russia: 54,
      turkey: 55,
    },
    color: {
      red: 76,
      gray: 77,
      blue: 78,
      black: 79,
      green: 80,
      violet: 81,
      multicolor: 82,
      yellow: 84,
    },
  },
  orders: {
    paymentMethod: {
      inCash: 1,
      account: 2,
      card: 3,
    },
    deliveryMethod: {
      courier: 4,
      selfPickup: 5,
    },
    status: {
      new: 41,
      paid: 42,
      delivered: 43,
      cancelled: 44,
      archived: 46,
    },
  },
  shoeSizes: {
    cls: {
      forKids: 72,
      beforeSchool: 73,
    },
  },
  global: {
    tax: {
      none: 50,
      perc10: 51,
      perc20: 52,
    },
    kidAge: {
      0: 56,
      1: 57,
      2: 58,
      3: 59,
      4: 60,
      5: 61,
      6: 62,
      7: 63,
      8: 64,
      9: 65,
      10: 66,
      11: 67,
      12: 68,
    },
    kidGender: {
      male: 69,
      female: 70,
      unisex: 71,
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertProducts = (products: any[]) => {
  const multicards = new Map<string, any[]>();

  products.forEach((product) => {
    let sorted = multicards.get(product.modelName);
    if (typeof sorted === "undefined") {
      sorted = [];
      multicards.set(product.modelName, sorted);
    }
    sorted.push(product);
  });

  return multicards;
};
