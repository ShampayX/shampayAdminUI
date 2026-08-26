export interface Product {
  _id: string;
  productName: string;
}

export interface Category {
  _id: string;
  category_name: string;
  crid_Identifier: string;
}

export interface ProductLimit {
  productName: string;
  day: number;
  month: number;
  dailyUsed?: number;
  monthlyUsed?: number;
  categoryId: string;
  categoryName: string;
}

export interface ApiUser {
  _id: string;
  firstName: string;
  lastName: string;
  userCode: string;
  company_name: string;
  limits: {
    [productId: string]: ProductLimit;
  };
}
