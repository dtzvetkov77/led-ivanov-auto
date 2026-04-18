import { createServiceClient } from './supabase/server'

export async function generateOrderNumber(): Promise<string> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('generate_order_number')
  if (error) {
    throw new Error(`Failed to generate order number: ${error.message}`)
  }
  return data as string
}
