export interface User {
  id: number
  name: string
  email: string
  profile_photo: string | null
  role: string
  first_access: number
  created_at: string
  updated_at: string
  tenant_id: number
}

export interface BarberShop {
  id: number
  company_name: string
  slug: string
  domain: string | null
  primary_color: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: number
  company_name: string
  slug: string
  domain: string | null
  primary_color: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: number
  tenant_id: number
  category_id: number
  name: string
  price: string
  duration_minutes: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  tenant_id: number
  name: string
  description: string | null
  active: number
  created_at: string
  updated_at: string
  services: Service[]
}
