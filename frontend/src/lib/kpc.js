export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
export const guestCartKey = 'kpc_guest_cart'
export const sessionKey = 'kpc_session'
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function currency(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))
}

export function mediaUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/storage')) return `${API_ORIGIN}${path}`
  return path
}

export function moneyNumber(value) {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : ''
}

const specTemplates = {
  processors: ['Brand', 'Processor', 'Model', 'Socket', 'Cores', 'Threads', 'Base Clock', 'Boost Clock', 'Cache', 'Integrated Graphics', 'Memory Support', 'TDP', 'Warranty Type', 'Condition'],
  motherboard: ['Brand', 'Model', 'Socket', 'Chipset', 'Form Factor', 'Memory Type', 'Memory Slots', 'Max Memory', 'Storage Slots', 'Expansion Slots', 'Wireless', 'Rear I/O', 'Warranty Type', 'Condition'],
  'graphics card': ['Brand', 'GPU', 'Graphic Card Model', 'Model', 'Graphics Memory', 'Memory Type', 'Memory Bus', 'Core Clock', 'Interface', 'Video Outputs', 'Power Connectors', 'Recommended PSU', 'Card Size', 'Warranty Type', 'Condition'],
  memory: ['Brand', 'Type', 'Capacity', 'Speed', 'CAS Latency', 'Voltage', 'Kit Configuration', 'RGB Lighting', 'Warranty Type', 'Condition'],
  'solid state drives': ['Brand', 'Capacity', 'Form Factor', 'Interface', 'Sequential Read', 'Sequential Write', 'NAND Type', 'Endurance', 'Warranty Type', 'Condition'],
  'hard disk drives': ['Brand', 'Capacity', 'Form Factor', 'Interface', 'RPM', 'Cache', 'Warranty Type', 'Condition'],
  'power supply': ['Brand', 'Wattage', 'Efficiency Rating', 'Modularity', 'Form Factor', 'Fan Size', 'Connectors', 'Warranty Type', 'Condition'],
  headphones: ['Brand', 'Model', 'Driver Size', 'Connection', 'Microphone', 'Frequency Response', 'Weight', 'Cable Length', 'Warranty Type', 'Condition'],
  laptop: ['Brand', 'Processor', 'Graphics', 'Memory', 'Storage', 'Display', 'Operating System', 'Battery', 'Warranty Type', 'Condition'],
  monitors: ['Brand', 'Panel Type', 'Size', 'Resolution', 'Refresh Rate', 'Response Time', 'Ports', 'Adaptive Sync', 'Warranty Type', 'Condition'],
  mouse: ['Brand', 'Sensor', 'DPI', 'Connection', 'Buttons', 'Weight', 'Battery Life', 'Warranty Type', 'Condition'],
  keyboard: ['Brand', 'Switch Type', 'Layout', 'Connection', 'Lighting', 'Keycaps', 'Warranty Type', 'Condition'],
  cooling: ['Brand', 'Cooling Type', 'Fan Size', 'Radiator Size', 'Socket Support', 'RGB Lighting', 'Warranty Type', 'Condition'],
}

const defaultSpecTemplate = ['Brand', 'Model', 'Type', 'Compatibility', 'Warranty Type', 'Condition']

export function specTemplateFor(categoryName = '') {
  return specTemplates[categoryName.toLowerCase()] || defaultSpecTemplate
}

export function emptySpecsFor(categoryName = '') {
  return Object.fromEntries(specTemplateFor(categoryName).map((field) => [field, '']))
}

export async function api(path, options = {}, token) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || Object.values(data.errors || {})?.[0]?.[0] || 'Request failed')
  }
  return data
}
