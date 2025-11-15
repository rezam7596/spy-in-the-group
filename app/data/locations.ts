import { Location } from '../types/game';

export const DEFAULT_LOCATIONS: Location[] = [
  {
    name: {
      en: 'Hospital',
      fa: 'بیمارستان',
      sv: 'Sjukhus',
      zh: '医院',
      hi: 'अस्पताल',
      es: 'Hospital',
      fr: 'Hôpital',
      ar: 'مستشفى',
    },
    roles: ['Doctor', 'Nurse', 'Patient', 'Surgeon', 'Receptionist', 'Paramedic'],
  },
  {
    name: {
      en: 'Restaurant',
      fa: 'رستوران',
      sv: 'Restaurang',
      zh: '餐厅',
      hi: 'रेस्टोरेंट',
      es: 'Restaurante',
      fr: 'Restaurant',
      ar: 'مطعم',
    },
    roles: ['Chef', 'Waiter', 'Customer', 'Manager', 'Bartender', 'Host'],
  },
  {
    name: {
      en: 'School',
      fa: 'مدرسه',
      sv: 'Skola',
      zh: '学校',
      hi: 'स्कूल',
      es: 'Escuela',
      fr: 'École',
      ar: 'مدرسة',
    },
    roles: ['Teacher', 'Student', 'Principal', 'Janitor', 'Librarian', 'Coach'],
  },
  {
    name: {
      en: 'Airport',
      fa: 'فرودگاه',
      sv: 'Flygplats',
      zh: '机场',
      hi: 'हवाई अड्डा',
      es: 'Aeropuerto',
      fr: 'Aéroport',
      ar: 'مطار',
    },
    roles: ['Pilot', 'Flight Attendant', 'Passenger', 'Security', 'Customs Officer', 'Baggage Handler'],
  },
  {
    name: {
      en: 'Beach',
      fa: 'ساحل',
      sv: 'Strand',
      zh: '海滩',
      hi: 'समुद्र तट',
      es: 'Playa',
      fr: 'Plage',
      ar: 'شاطئ',
    },
    roles: ['Lifeguard', 'Sunbather', 'Surfer', 'Beach Vendor', 'Tourist', 'Photographer'],
  },
  {
    name: {
      en: 'Bank',
      fa: 'بانک',
      sv: 'Bank',
      zh: '银行',
      hi: 'बैंक',
      es: 'Banco',
      fr: 'Banque',
      ar: 'بنك',
    },
    roles: ['Teller', 'Customer', 'Manager', 'Security Guard', 'Loan Officer', 'Accountant'],
  },
  {
    name: {
      en: 'Hotel',
      fa: 'هتل',
      sv: 'Hotell',
      zh: '酒店',
      hi: 'होटल',
      es: 'Hotel',
      fr: 'Hôtel',
      ar: 'فندق',
    },
    roles: ['Receptionist', 'Guest', 'Bellhop', 'Manager', 'Housekeeper', 'Concierge'],
  },
  {
    name: {
      en: 'Police Station',
      fa: 'ایستگاه پلیس',
      sv: 'Polisstation',
      zh: '警察局',
      hi: 'पुलिस स्टेशन',
      es: 'Comisaría',
      fr: 'Commissariat',
      ar: 'مركز الشرطة',
    },
    roles: ['Police Officer', 'Detective', 'Suspect', 'Dispatcher', 'Captain', 'Witness'],
  },
  {
    name: {
      en: 'Movie Theater',
      fa: 'سینما',
      sv: 'Biograf',
      zh: '电影院',
      hi: 'सिनेमाघर',
      es: 'Cine',
      fr: 'Cinéma',
      ar: 'دار السينما',
    },
    roles: ['Moviegoer', 'Ticket Seller', 'Usher', 'Projectionist', 'Concession Worker', 'Manager'],
  },
  {
    name: {
      en: 'Supermarket',
      fa: 'سوپرمارکت',
      sv: 'Snabbköp',
      zh: '超市',
      hi: 'सुपरमार्केट',
      es: 'Supermercado',
      fr: 'Supermarché',
      ar: 'سوبرماركت',
    },
    roles: ['Cashier', 'Shopper', 'Manager', 'Stock Clerk', 'Butcher', 'Security Guard'],
  },
  {
    name: {
      en: 'Military Base',
      fa: 'پایگاه نظامی',
      sv: 'Militärbas',
      zh: '军事基地',
      hi: 'सैन्य अड्डा',
      es: 'Base Militar',
      fr: 'Base Militaire',
      ar: 'قاعدة عسكرية',
    },
    roles: ['Soldier', 'Officer', 'Medic', 'Engineer', 'Cook', 'Commander'],
  },
  {
    name: {
      en: 'Circus',
      fa: 'سیرک',
      sv: 'Cirkus',
      zh: '马戏团',
      hi: 'सर्कस',
      es: 'Circo',
      fr: 'Cirque',
      ar: 'سيرك',
    },
    roles: ['Clown', 'Acrobat', 'Ringmaster', 'Animal Trainer', 'Magician', 'Spectator'],
  },
  {
    name: {
      en: 'Space Station',
      fa: 'ایستگاه فضایی',
      sv: 'Rymdstation',
      zh: '空间站',
      hi: 'अंतरिक्ष स्टेशन',
      es: 'Estación Espacial',
      fr: 'Station Spatiale',
      ar: 'محطة فضائية',
    },
    roles: ['Astronaut', 'Engineer', 'Scientist', 'Commander', 'Medical Officer', 'Pilot'],
  },
  {
    name: {
      en: 'Casino',
      fa: 'کازینو',
      sv: 'Kasino',
      zh: '赌场',
      hi: 'कैसीनो',
      es: 'Casino',
      fr: 'Casino',
      ar: 'كازينو',
    },
    roles: ['Dealer', 'Gambler', 'Security', 'Bartender', 'Pit Boss', 'Waitress'],
  },
  {
    name: {
      en: 'Pirate Ship',
      fa: 'کشتی دزدان دریایی',
      sv: 'Piratskepp',
      zh: '海盗船',
      hi: 'समुद्री डाकू जहाज',
      es: 'Barco Pirata',
      fr: 'Navire Pirate',
      ar: 'سفينة قراصنة',
    },
    roles: ['Captain', 'First Mate', 'Cook', 'Sailor', 'Gunner', 'Prisoner'],
  },
  {
    name: {
      en: 'Submarine',
      fa: 'زیردریایی',
      sv: 'Ubåt',
      zh: '潜水艇',
      hi: 'पनडुब्बी',
      es: 'Submarino',
      fr: 'Sous-marin',
      ar: 'غواصة',
    },
    roles: ['Captain', 'Navigator', 'Engineer', 'Sonar Operator', 'Cook', 'Torpedo Officer'],
  },
  {
    name: {
      en: 'Library',
      fa: 'کتابخانه',
      sv: 'Bibliotek',
      zh: '图书馆',
      hi: 'पुस्तकालय',
      es: 'Biblioteca',
      fr: 'Bibliothèque',
      ar: 'مكتبة',
    },
    roles: ['Librarian', 'Student', 'Author', 'IT Specialist', 'Security', 'Visitor'],
  },
  {
    name: {
      en: 'Art Museum',
      fa: 'موزه هنر',
      sv: 'Konstmuseum',
      zh: '艺术博物馆',
      hi: 'कला संग्रहालय',
      es: 'Museo de Arte',
      fr: 'Musée d\'Art',
      ar: 'متحف فني',
    },
    roles: ['Curator', 'Artist', 'Visitor', 'Security Guard', 'Tour Guide', 'Art Student'],
  },
  {
    name: {
      en: 'Train Station',
      fa: 'ایستگاه قطار',
      sv: 'Tågstation',
      zh: '火车站',
      hi: 'रेलवे स्टेशन',
      es: 'Estación de Tren',
      fr: 'Gare',
      ar: 'محطة قطار',
    },
    roles: ['Conductor', 'Passenger', 'Ticket Agent', 'Engineer', 'Porter', 'Security'],
  },
  {
    name: {
      en: 'Zoo',
      fa: 'باغ وحش',
      sv: 'Zoo',
      zh: '动物园',
      hi: 'चिड़ियाघर',
      es: 'Zoológico',
      fr: 'Zoo',
      ar: 'حديقة الحيوان',
    },
    roles: ['Zookeeper', 'Visitor', 'Veterinarian', 'Tour Guide', 'Photographer', 'Gift Shop Worker'],
  },
];

export function getRandomLocation(): Location {
  const randomIndex = Math.floor(Math.random() * DEFAULT_LOCATIONS.length);
  return DEFAULT_LOCATIONS[randomIndex];
}

export function getRandomRole(location: Location, usedRoles: string[] = []): string {
  const availableRoles = location.roles.filter(role => !usedRoles.includes(role));
  if (availableRoles.length === 0) {
    // If all roles are used, just pick a random one
    return location.roles[Math.floor(Math.random() * location.roles.length)];
  }
  const randomIndex = Math.floor(Math.random() * availableRoles.length);
  return availableRoles[randomIndex];
}
