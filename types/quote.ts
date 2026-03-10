export interface LineItem {
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface Quote {
  clientName: string
  jobTitle: string
  jobAddress: string
  jobDescription: string
  lineItems: LineItem[]
  laborTotal: number
  materialsTotal: number
  subtotal: number
  tax: number
  taxRate: number
  grandTotal: number
  estimatedDays: number
  validDays: number
  notes: string
}
