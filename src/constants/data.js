// ─── Chaghaf App · Data ──────────────────────────────────────────

export const USER = {
  id: 'u001',
  name: 'Ahmed Benali',
  email: 'ahmed@chaghaf.ma',
  phone: '+212 6 00 00 00',
  avatar: 'A',
  memberSince: 'Janvier 2025',
  pack: {
    type: 'Mensuel',
    persons: 2,
    status: 'actif',
    expiresAt: '18 Avril 2025',
    daysLeft: 18,
  },
  stats: {
    sessions: 127,
    hoursThisMonth: 42,
    streak: 8,
  },
};

export const PACKS = [
  {
    id: 'p1',
    backendType: 'BASIC',
    name: 'Basique',
    icon: 'person-outline',
    monthlyPrice: 500,
    annualPrice: 5500,
    features: ['Wifi haut débit', 'Café illimité', 'Accès 5j/7'],
  },
  {
    id: 'p2',
    backendType: 'PREMIUM',
    name: 'Premium',
    icon: 'people-outline',
    monthlyPrice: 1200,
    annualPrice: 13200,
    popular: true,
    features: ['Tout du Basique', '10h salle de réunion', 'Imprimante'],
  },
  {
    id: 'p3',
    backendType: 'VIP',
    name: 'VIP',
    icon: 'people-circle-outline',
    monthlyPrice: 2500,
    annualPrice: 27500,
    features: ['Tout du Premium', 'Bureau privé', 'Salles illimitées'],
  },
  {
    id: 'p4',
    backendType: 'STUDENT',
    name: 'Étudiant',
    icon: 'school-outline',
    monthlyPrice: 250,
    annualPrice: 2750,
    features: ['Wifi', 'Café', 'Accès 3j/semaine'],
  },
];

export const SALLES = [
  {
    id: 's1',
    name: 'Salle de Réunion',
    icon: 'business-outline',
    capacity: '1–8 personnes',
    features: ['Projecteur', 'WiFi', 'AC'],
    halfDayPrice: 20,
    fullDayPrice: 30,
  },
  {
    id: 's2',
    name: 'Studio Photo',
    icon: 'camera-outline',
    capacity: '1–3 personnes',
    features: ['Fond blanc', 'Éclairage', 'Trépied'],
    halfDayPrice: 20,
    fullDayPrice: 30,
  },
  {
    id: 's3',
    name: 'Studio Podcast',
    icon: 'mic-outline',
    capacity: '1–4 personnes',
    features: ['Micro', 'Casques', 'Isolation'],
    halfDayPrice: 20,
    fullDayPrice: 30,
  },
];

export const BOISSONS = [
  { id: 'b1', name: 'Café Chaud', icon: 'cafe-outline', included: true },
  { id: 'b2', name: 'Ice Coffee', icon: 'snow-outline', included: true },
  { id: 'b3', name: 'Thé', icon: 'leaf-outline', included: true },
  { id: 'b4', name: 'Eau', icon: 'water-outline', included: true },
];

export const CAFE_GUIDE = [
  { step: 1, text: "Vérifier le niveau d'eau (voyant bleu)" },
  { step: 2, text: 'Insérer la capsule dans le compartiment' },
  { step: 3, text: 'Placer ta tasse sous le bec verseur' },
  { step: 4, text: 'Choisir taille (court / lungo / grand)' },
  { step: 5, text: 'Appuyer et attendre 30 secondes' },
];

export const SNACKS = [
  { id: 'sn1', name: 'Tacos', icon: 'fast-food-outline', price: 25, category: 'Plats' },
  { id: 'sn2', name: 'Sandwich', icon: 'sandwich-outline', price: 18, category: 'Plats' },
  { id: 'sn3', name: 'Frites', icon: 'restaurant-outline', price: 12, category: 'Accompagnements' },
  { id: 'sn4', name: 'Salade', icon: 'nutrition-outline', price: 22, category: 'Plats' },
  { id: 'sn5', name: 'Jus frais', icon: 'wine-outline', price: 10, category: 'Boissons' },
  { id: 'sn6', name: 'Pizza', icon: 'pizza-outline', price: 35, category: 'Plats' },
  { id: 'sn7', name: 'Croissant', icon: 'cafe-outline', price: 8, category: 'Snacks' },
  { id: 'sn8', name: 'Brownie', icon: 'cube-outline', price: 15, category: 'Desserts' },
];

export const POSTS = [
  {
    id: 'post1',
    author: 'Ahmed Benali',
    avatar: 'A',
    time: 'il y a 5 min',
    role: 'Membre',
    text: 'Super session de travail ce matin ! L\'ambiance est parfaite.',
    likes: 12,
    comments: 3,
  },
  {
    id: 'post2',
    author: 'Chaghaf',
    avatar: 'C',
    time: 'il y a 2h',
    role: 'Staff',
    text: 'Nouveau studio podcast disponible. Réservez dès maintenant dans l\'app.',
    likes: 24,
    comments: 8,
    isOfficial: true,
  },
  {
    id: 'post3',
    author: 'Sara Mimouni',
    avatar: 'S',
    time: 'Hier',
    role: 'Membre',
    text: 'La salle de réunion est parfaite pour nos meetings d\'équipe. Merci Chaghaf !',
    likes: 18,
    comments: 5,
  },
];

export const CONVERSATIONS = [
  {
    id: 'c1',
    name: 'Groupe Chaghaf',
    avatar: 'C',
    lastMessage: 'Événement vendredi soir !',
    time: '09:15',
    unread: 3,
    isGroup: true,
  },
  {
    id: 'c2',
    name: 'Sara Mimouni',
    avatar: 'S',
    lastMessage: 'Tu viens cet après-midi ?',
    time: 'Hier',
    unread: 1,
  },
  {
    id: 'c3',
    name: 'Youssef Tazi',
    avatar: 'Y',
    lastMessage: 'Super la nouvelle salle podcast !',
    time: 'Mer',
    unread: 0,
  },
  {
    id: 'c4',
    name: 'Staff Chaghaf',
    avatar: 'S',
    lastMessage: 'Votre réservation est confirmée',
    time: 'Mar',
    unread: 0,
  },
];

export const MESSAGES = [
  { id: 'm1', sender: 'them', text: 'Bonjour Ahmed ! Comment se passe ta journée ?', time: '09:10' },
  { id: 'm2', sender: 'me', text: 'Très bien merci ! Je suis en train de finir mon projet.', time: '09:12' },
  { id: 'm3', sender: 'them', text: 'Tu viens cet après-midi ?', time: '09:14' },
  { id: 'm4', sender: 'me', text: 'Oui je serai là vers 14h !', time: '09:15' },
];
