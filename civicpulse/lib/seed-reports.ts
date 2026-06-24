export interface CivicReport {
  id: string
  category: 'pothole' | 'water_leakage' | 'streetlight' | 'waste_management' | 'other'
  description: string
  severity: 'low' | 'medium' | 'high'
  department: string
  lat: number
  lon: number
  timeAgo: string
  report: string
}

export const seedReports: CivicReport[] = [
  {
    id: '1',
    category: 'pothole',
    description: 'Large pothole on road near Jubilee Hills causing vehicles to swerve.',
    severity: 'high',
    department: 'Roads and Infrastructure',
    lat: 17.4326,
    lon: 78.4071,
    timeAgo: '2 hours ago',
    report: 'A large pothole has been identified near Jubilee Hills road posing significant safety risk to motorists. Immediate repair is recommended by Roads and Infrastructure department.',
  },
  {
    id: '2',
    category: 'streetlight',
    description: 'Burnt out streetlight on Banjara Hills road creating dark patch at night.',
    severity: 'medium',
    department: 'Electrical/Streetlighting',
    lat: 17.4156,
    lon: 78.4347,
    timeAgo: '5 hours ago',
    report: 'A non-functional streetlight has been reported on Banjara Hills road creating unsafe conditions after dark. Electrical department should replace the unit within standard SLA.',
  },
  {
    id: '3',
    category: 'water_leakage',
    description: 'Water pipe burst on Madhapur main road causing waterlogging.',
    severity: 'high',
    department: 'Water Board',
    lat: 17.4485,
    lon: 78.3908,
    timeAgo: '1 hour ago',
    report: 'A burst water pipe on Madhapur main road is causing significant waterlogging and traffic disruption. Water Board must dispatch repair crew urgently.',
  },
  {
    id: '4',
    category: 'waste_management',
    description: 'Overflowing garbage bin near Kondapur market area.',
    severity: 'low',
    department: 'Sanitation',
    lat: 17.4600,
    lon: 78.3615,
    timeAgo: '3 hours ago',
    report: 'An overflowing garbage bin near Kondapur market is creating unhygienic conditions for local residents. Sanitation department should schedule immediate collection.',
  },
  {
    id: '5',
    category: 'pothole',
    description: 'Multiple potholes on Gachibowli flyover approach road.',
    severity: 'high',
    department: 'Roads and Infrastructure',
    lat: 17.4401,
    lon: 78.3489,
    timeAgo: '4 hours ago',
    report: 'Multiple potholes on the Gachibowli flyover approach road are causing severe vehicle damage and accident risk. Roads department must prioritize emergency patching.',
  },
  {
    id: '6',
    category: 'other',
    description: 'Damaged footpath tiles near Hitech City metro station.',
    severity: 'medium',
    department: 'Municipal Corporation',
    lat: 17.4474,
    lon: 78.3762,
    timeAgo: '1 day ago',
    report: 'Damaged and uneven footpath tiles near Hitech City metro station present a trip hazard for daily commuters. Municipal Corporation should schedule resurfacing.',
  },
]
