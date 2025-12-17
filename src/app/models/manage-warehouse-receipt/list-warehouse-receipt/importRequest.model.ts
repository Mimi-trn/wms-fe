export interface ImportRequest {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  currency: number;
  documentAt: string;
  exchangeRate: number;
  note: string;
  poCode: number;
  prCode: number;
  source: number;
  status: number;
  deliveryAt: string;
  discount: number;
  tax: number;
  shipTo: string;
  shippingType: number;
  supplierAddress: string;
}
