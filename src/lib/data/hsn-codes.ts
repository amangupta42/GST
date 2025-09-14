export interface HSNCode {
  code: string;
  description: string;
  category: 'B2B' | 'B2C' | 'Export' | 'NilRated';
  gstRate: number;
  chapter: string;
  subheading?: string;
}

export const hsnCodes: HSNCode[] = [
  // Chapter 10: Cereals
  { code: '1001', description: 'Wheat and meslin', category: 'B2B', gstRate: 0, chapter: 'Cereals' },
  { code: '1006', description: 'Rice', category: 'B2B', gstRate: 0, chapter: 'Cereals' },
  
  // Chapter 15: Animal/vegetable fats and oils
  { code: '1507', description: 'Soya-bean oil and its fractions', category: 'B2C', gstRate: 5, chapter: 'Fats and Oils' },
  { code: '1511', description: 'Palm oil and its fractions', category: 'B2C', gstRate: 5, chapter: 'Fats and Oils' },
  
  // Chapter 17: Sugars and sugar confectionery
  { code: '1701', description: 'Cane or beet sugar and chemically pure sucrose', category: 'B2C', gstRate: 0, chapter: 'Sugars' },
  { code: '1704', description: 'Sugar confectionery', category: 'B2C', gstRate: 18, chapter: 'Sugars' },
  
  // Chapter 22: Beverages, spirits and vinegar
  { code: '2201', description: 'Waters, including natural or artificial mineral waters', category: 'B2C', gstRate: 18, chapter: 'Beverages' },
  { code: '2202', description: 'Waters containing added sugar or other sweetening matter', category: 'B2C', gstRate: 28, chapter: 'Beverages' },
  
  // Chapter 25: Salt; sulphur; earths and stone; plastering materials
  { code: '2501', description: 'Salt', category: 'B2C', gstRate: 5, chapter: 'Salt and Stone' },
  { code: '2517', description: 'Pebbles, gravel, broken or crushed stone', category: 'B2B', gstRate: 5, chapter: 'Salt and Stone' },
  
  // Chapter 27: Mineral fuels, oils and waxes
  { code: '2710', description: 'Petroleum oils and oils obtained from bituminous minerals', category: 'B2C', gstRate: 28, chapter: 'Mineral Fuels' },
  { code: '2711', description: 'Petroleum gases and other gaseous hydrocarbons', category: 'B2B', gstRate: 5, chapter: 'Mineral Fuels' },
  
  // Chapter 30: Pharmaceutical products
  { code: '3003', description: 'Medicaments consisting of two or more constituents', category: 'B2C', gstRate: 12, chapter: 'Pharmaceuticals' },
  { code: '3004', description: 'Medicaments consisting of mixed or unmixed products', category: 'B2C', gstRate: 5, chapter: 'Pharmaceuticals' },
  
  // Chapter 33: Essential oils and perfumery
  { code: '3303', description: 'Perfumes and toilet waters', category: 'B2C', gstRate: 28, chapter: 'Perfumery' },
  { code: '3307', description: 'Pre-shave, shaving or after-shave preparations', category: 'B2C', gstRate: 28, chapter: 'Perfumery' },
  
  // Chapter 39: Plastics and articles thereof
  { code: '3901', description: 'Polymers of ethylene, in primary forms', category: 'B2B', gstRate: 18, chapter: 'Plastics' },
  { code: '3920', description: 'Other plates, sheets, film, foil of plastics', category: 'B2B', gstRate: 18, chapter: 'Plastics' },
  
  // Chapter 40: Rubber and articles thereof
  { code: '4011', description: 'New pneumatic tyres, of rubber', category: 'B2C', gstRate: 28, chapter: 'Rubber' },
  { code: '4016', description: 'Other articles of vulcanised rubber', category: 'B2B', gstRate: 18, chapter: 'Rubber' },
  
  // Chapter 48: Paper and paperboard
  { code: '4802', description: 'Uncoated paper and paperboard', category: 'B2B', gstRate: 12, chapter: 'Paper' },
  { code: '4819', description: 'Cartons, boxes, cases, bags of paper', category: 'B2B', gstRate: 12, chapter: 'Paper' },
  
  // Chapter 52: Cotton
  { code: '5201', description: 'Cotton, not carded or combed', category: 'B2B', gstRate: 0, chapter: 'Cotton' },
  { code: '5208', description: 'Woven fabrics of cotton', category: 'B2C', gstRate: 5, chapter: 'Cotton' },
  
  // Chapter 61: Articles of apparel, knitted
  { code: '6109', description: 'T-shirts, singlets and other vests, knitted', category: 'B2C', gstRate: 12, chapter: 'Apparel' },
  { code: '6110', description: 'Jerseys, pullovers, cardigans, knitted', category: 'B2C', gstRate: 12, chapter: 'Apparel' },
  
  // Chapter 62: Articles of apparel, not knitted
  { code: '6203', description: 'Men\'s or boys\' suits, ensembles, jackets', category: 'B2C', gstRate: 12, chapter: 'Apparel' },
  { code: '6204', description: 'Women\'s or girls\' suits, ensembles, jackets', category: 'B2C', gstRate: 12, chapter: 'Apparel' },
  
  // Chapter 63: Other made up textile articles
  { code: '6302', description: 'Bed linen, table linen, toilet linen', category: 'B2C', gstRate: 18, chapter: 'Textiles' },
  { code: '6307', description: 'Other made up articles of textiles', category: 'B2C', gstRate: 18, chapter: 'Textiles' },
  
  // Chapter 64: Footwear
  { code: '6403', description: 'Footwear with outer soles of rubber, plastics', category: 'B2C', gstRate: 18, chapter: 'Footwear' },
  { code: '6404', description: 'Footwear with outer soles of rubber, plastics', category: 'B2C', gstRate: 5, chapter: 'Footwear' },
  
  // Chapter 70: Glass and glassware
  { code: '7010', description: 'Carboys, bottles, flasks of glass', category: 'B2B', gstRate: 18, chapter: 'Glass' },
  { code: '7013', description: 'Glassware for table, kitchen, toilet, office', category: 'B2C', gstRate: 18, chapter: 'Glass' },
  
  // Chapter 72: Iron and steel
  { code: '7208', description: 'Flat-rolled products of iron or steel', category: 'B2B', gstRate: 18, chapter: 'Iron and Steel' },
  { code: '7214', description: 'Other bars and rods of iron or steel', category: 'B2B', gstRate: 18, chapter: 'Iron and Steel' },
  
  // Chapter 73: Articles of iron or steel
  { code: '7308', description: 'Structures and parts of structures of iron', category: 'B2B', gstRate: 18, chapter: 'Iron Articles' },
  { code: '7326', description: 'Other articles of iron or steel', category: 'B2B', gstRate: 18, chapter: 'Iron Articles' },
  
  // Chapter 76: Aluminium and articles thereof
  { code: '7601', description: 'Unwrought aluminium', category: 'B2B', gstRate: 18, chapter: 'Aluminium' },
  { code: '7616', description: 'Other articles of aluminium', category: 'B2B', gstRate: 18, chapter: 'Aluminium' },
  
  // Chapter 84: Machinery and mechanical appliances
  { code: '8414', description: 'Air or vacuum pumps, air or other gas compressors', category: 'B2B', gstRate: 18, chapter: 'Machinery' },
  { code: '8418', description: 'Refrigerators, freezers and other refrigerating', category: 'B2C', gstRate: 18, chapter: 'Machinery' },
  { code: '8471', description: 'Automatic data processing machines and units', category: 'B2B', gstRate: 18, chapter: 'Machinery' },
  { code: '8473', description: 'Parts and accessories for machines of heading 8470', category: 'B2B', gstRate: 18, chapter: 'Machinery' },
  
  // Chapter 85: Electrical machinery and equipment
  { code: '8501', description: 'Electric motors and generators', category: 'B2B', gstRate: 18, chapter: 'Electrical' },
  { code: '8517', description: 'Telephone sets, including smartphones', category: 'B2C', gstRate: 12, chapter: 'Electrical' },
  { code: '8518', description: 'Microphones and stands, loudspeakers', category: 'B2C', gstRate: 18, chapter: 'Electrical' },
  { code: '8528', description: 'Monitors and projectors, television receivers', category: 'B2C', gstRate: 18, chapter: 'Electrical' },
  
  // Chapter 87: Vehicles other than railway
  { code: '8703', description: 'Motor cars and other motor vehicles', category: 'B2C', gstRate: 28, chapter: 'Vehicles' },
  { code: '8711', description: 'Motorcycles and cycles with auxiliary motor', category: 'B2C', gstRate: 28, chapter: 'Vehicles' },
  
  // Chapter 90: Optical, photographic, measuring instruments
  { code: '9001', description: 'Optical fibres and optical fibre bundles', category: 'B2B', gstRate: 18, chapter: 'Optical' },
  { code: '9013', description: 'Liquid crystal devices, lasers', category: 'B2B', gstRate: 18, chapter: 'Optical' },
  
  // Chapter 94: Furniture; bedding, mattresses
  { code: '9401', description: 'Seats, whether or not convertible into beds', category: 'B2C', gstRate: 18, chapter: 'Furniture' },
  { code: '9403', description: 'Other furniture and parts thereof', category: 'B2C', gstRate: 18, chapter: 'Furniture' },
  
  // Chapter 95: Toys, games and sports requisites
  { code: '9503', description: 'Tricycles, scooters, pedal cars and similar toys', category: 'B2C', gstRate: 12, chapter: 'Toys' },
  { code: '9504', description: 'Video game consoles and machines', category: 'B2C', gstRate: 28, chapter: 'Toys' },
  
  // Services HSN codes
  { code: '9954', description: 'Legal services', category: 'B2B', gstRate: 18, chapter: 'Services' },
  { code: '9961', description: 'Information technology software services', category: 'B2B', gstRate: 18, chapter: 'Services' },
  { code: '9967', description: 'Consulting services', category: 'B2B', gstRate: 18, chapter: 'Services' },
  { code: '9972', description: 'Maintenance and repair services', category: 'B2B', gstRate: 18, chapter: 'Services' },
  { code: '9987', description: 'Advertising services', category: 'B2B', gstRate: 18, chapter: 'Services' },
  { code: '9994', description: 'Transportation of goods by road', category: 'B2B', gstRate: 5, chapter: 'Services' },
  { code: '9996', description: 'Renting services involving own or leased property', category: 'B2B', gstRate: 18, chapter: 'Services' },
];

export const getHSNCodesByCategory = (category: string): HSNCode[] => {
  return hsnCodes.filter(hsn => hsn.category === category);
};

export const getHSNCodesByChapter = (chapter: string): HSNCode[] => {
  return hsnCodes.filter(hsn => hsn.chapter === chapter);
};

export const searchHSNCodes = (query: string): HSNCode[] => {
  const lowercaseQuery = query.toLowerCase();
  return hsnCodes.filter(hsn => 
    hsn.code.includes(query) ||
    hsn.description.toLowerCase().includes(lowercaseQuery) ||
    hsn.chapter.toLowerCase().includes(lowercaseQuery)
  );
};

export const getHSNCodeDetails = (code: string): HSNCode | undefined => {
  return hsnCodes.find(hsn => hsn.code === code);
};

export const getSuggestedGSTRate = (hsnCode: string): number => {
  const hsn = getHSNCodeDetails(hsnCode);
  return hsn?.gstRate || 18; // Default to 18% if not found
};

export const getChapters = (): string[] => {
  return Array.from(new Set(hsnCodes.map(hsn => hsn.chapter))).sort();
};