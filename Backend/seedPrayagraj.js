const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospitalFinder';

mongoose.connect(MONGODB_URI).then(async () => {
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));

  const prayagrajHospitals = [
    {
      name: 'Swaroop Rani Nehru Hospital (SRN)',
      shortName: 'SRN Prayagraj',
      type: 'Government Super Specialty',
      isVerified: true,
      isActive: true,
      location: { lat: 25.4485, lng: 81.8512, address: 'MG Marg, George Town', city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211002' },
      geo: { type: 'Point', coordinates: [81.8512, 25.4485] },
      beds: { total: 450, available: 85, icu: { total: 80, available: 24 }, emergency: { total: 40, available: 12 } },
      specialists: ['Trauma Surgeon', 'Cardiologist', 'Neurologist', 'Orthopedic'],
      rating: 4.8
    },
    {
      name: 'Tej Bahadur Sapru Hospital (Beli)',
      shortName: 'Beli Hospital',
      type: 'District Government Hospital',
      isVerified: true,
      isActive: true,
      location: { lat: 25.4520, lng: 81.8340, address: 'Beli Road, Katra', city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211002' },
      geo: { type: 'Point', coordinates: [81.8340, 25.4520] },
      beds: { total: 250, available: 42, icu: { total: 30, available: 9 }, emergency: { total: 20, available: 6 } },
      specialists: ['General', 'Orthopedic', 'Pediatrics'],
      rating: 4.6
    },
    {
      name: 'Nazareth Hospital',
      shortName: 'Nazareth Medical Center',
      type: 'Private Super Specialty',
      isVerified: true,
      isActive: true,
      location: { lat: 25.4552, lng: 81.8378, address: '13 Kamla Nehru Road', city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211001' },
      geo: { type: 'Point', coordinates: [81.8378, 25.4552] },
      beds: { total: 300, available: 60, icu: { total: 45, available: 15 }, emergency: { total: 25, available: 8 } },
      specialists: ['Cardiologist', 'Neurologist', 'Gynaecologist'],
      rating: 4.9
    },
    {
      name: 'Kamla Nehru Memorial Hospital',
      shortName: 'Kamla Nehru Hospital',
      type: 'Charitable Specialty Hospital',
      isVerified: true,
      isActive: true,
      location: { lat: 25.4420, lng: 81.8490, address: 'Hashimpur Road, Tagore Town', city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211002' },
      geo: { type: 'Point', coordinates: [81.8490, 25.4420] },
      beds: { total: 200, available: 35, icu: { total: 25, available: 8 }, emergency: { total: 15, available: 5 } },
      specialists: ['Gynaecologist', 'Oncology', 'Pediatrics'],
      rating: 4.7
    },
    {
      name: 'United Medicity Medical College & Hospital',
      shortName: 'United Medicity',
      type: 'Medical College & Trauma Center',
      isVerified: true,
      isActive: true,
      location: { lat: 25.4210, lng: 81.8150, address: 'Rawatpur, Near Transport Nagar', city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211011' },
      geo: { type: 'Point', coordinates: [81.8150, 25.4210] },
      beds: { total: 500, available: 110, icu: { total: 90, available: 32 }, emergency: { total: 50, available: 18 } },
      specialists: ['Trauma Surgeon', 'Cardiologist', 'Neurologist', 'Orthopedic'],
      rating: 4.8
    }
  ];

  for (const h of prayagrajHospitals) {
    await Hospital.updateOne({ name: h.name }, { $set: h }, { upsert: true });
  }

  console.log('Seeded Prayagraj hospitals successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
