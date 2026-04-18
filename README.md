# Chaghaf App — React Native Source Code

> Espace de coworking digital · Agadir, Maroc · chaghaf.community

## 🎨 Palette de couleurs
| Variable | Hex | Usage |
|----------|-----|-------|
| `primary` | `#BB3300` | Rouge Chaghaf — boutons, accents |
| `cream` | `#E8D9C4` | Fond principal — backgrounds |

## 📁 Structure du projet

```
chaghaf-app/
├── App.js                          # Point d'entrée
├── package.json                    # Dépendances
├── babel.config.js
└── src/
    ├── constants/
    │   ├── colors.js               # 🎨 Design system & palette
    │   └── data.js                 # 📦 Mock data (users, packs, snacks...)
    ├── navigation/
    │   └── AppNavigator.js         # 🧭 Navigation complète (Stack + Tabs)
    ├── components/
    │   └── index.js                # 🧩 Composants partagés (Button, Card...)
    └── screens/
        ├── auth/
        │   └── AuthScreens.js      # Splash · Onboarding · Login · Register
        ├── home/
        │   └── HomeScreens.js      # Dashboard · QR Code · Accès Journée
        ├── subscription/
        │   └── SubscriptionScreens.js  # Abonnement · Choix durée · Renouvellement
        ├── reservation/
        │   └── ReservationScreens.js   # Choix salle · Date/durée · Confirmation
        ├── boissons/
        │   └── BoissonScreens.js   # Validation · Choix · Guide machine
        ├── snacks/
        │   └── SnacksScreens.js    # Menu · Panier · Suivi commande
        ├── social/
        │   └── SocialScreens.js    # Posts · Créer post · Messages · Conversation
        └── profile/
            └── ProfilScreen.js     # Profil · Stats · Paramètres
```

## 🚀 Installation & Lancement

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI : `npm install -g expo-cli`
- Expo Go sur votre téléphone (iOS / Android)

### Étapes

```bash
# 1. Installer les dépendances
cd chaghaf-app
npm install

# 2. Lancer le serveur de développement
npx expo start

# 3. Scanner le QR code avec Expo Go
#    (iOS: appareil photo natif / Android: app Expo Go)
```

### Émulateur Android
```bash
npx expo start --android
```

### Simulateur iOS
```bash
npx expo start --ios
```

## 📱 Écrans inclus (22 écrans)

| # | Écran | Fichier |
|---|-------|---------|
| 1 | Splash Screen | AuthScreens.js |
| 2 | Onboarding | AuthScreens.js |
| 3 | Connexion | AuthScreens.js |
| 4 | Inscription | AuthScreens.js |
| 5 | Dashboard Accueil | HomeScreens.js |
| 6 | QR Code Check-in | HomeScreens.js |
| 7 | Accès Journée (20/30dh) | HomeScreens.js |
| 8 | Mon Abonnement | SubscriptionScreens.js |
| 9 | Choix Durée Pack | SubscriptionScreens.js |
| 10 | Renouvellement | SubscriptionScreens.js |
| 11 | Choix de Salle | ReservationScreens.js |
| 12 | Date & Durée | ReservationScreens.js |
| 13 | Confirmation Réservation | ReservationScreens.js |
| 14 | Validation Boisson | BoissonScreens.js |
| 15 | Choix Boisson | BoissonScreens.js |
| 16 | Confirmation Boisson | BoissonScreens.js |
| 17 | Guide Machine Café | BoissonScreens.js |
| 18 | Menu Snacks | SnacksScreens.js |
| 19 | Panier | SnacksScreens.js |
| 20 | Suivi Commande | SnacksScreens.js |
| 21 | Fil de Posts | SocialScreens.js |
| 22 | Créer un Post | SocialScreens.js |
| 23 | Liste Messages | SocialScreens.js |
| 24 | Conversation | SocialScreens.js |
| 25 | Mon Profil | ProfilScreen.js |

## 🗺️ Architecture Navigation

```
AuthStack
 ├── SplashScreen
 ├── OnboardingScreen
 ├── LoginScreen
 ├── RegisterScreen
 └── MainTabNavigator (Bottom Tabs)
      ├── 🏠 HomeStack
      │    ├── HomeScreen (Dashboard)
      │    ├── QRCodeScreen
      │    ├── AccesJourneeScreen
      │    ├── AbonnementScreen
      │    ├── ChoixDureeScreen
      │    ├── RenouvellementScreen
      │    └── ProfilScreen
      ├── 📅 ReservationStack
      │    ├── ChoixSalleScreen
      │    ├── DateDureeScreen
      │    └── ConfirmationReservationScreen
      ├── ☕ BoissonStack
      │    ├── ValidationBoissonScreen
      │    ├── ChoixBoissonScreen
      │    ├── ConfirmationBoissonScreen
      │    └── GuideMachineScreen
      ├── 🍔 SnacksStack
      │    ├── MenuSnacksScreen
      │    ├── PanierScreen
      │    └── SuiviCommandeScreen
      └── 💬 SocialStack
           ├── PostsScreen
           ├── CreerPostScreen
           ├── MessagesScreen
           └── ConversationScreen
```

## 🔧 Personnalisation

### Modifier les couleurs
Éditer `src/constants/colors.js` :
```js
export const COLORS = {
  primary: '#BB3300',   // Votre couleur principale
  cream:   '#E8D9C4',   // Fond de l'application
  ...
};
```

### Modifier les données
Éditer `src/constants/data.js` pour changer :
- `USER` — profil utilisateur test
- `PACKS` — tarifs abonnements
- `SALLES` — salles disponibles
- `SNACKS` — menu partenaire

### QR Code réel
Installer `react-native-qrcode-svg` et remplacer dans `QRCodeScreen.js` :
```js
import QRCode from 'react-native-qrcode-svg';
// ...
<QRCode value={qrValue} size={220} color={COLORS.primary} />
```

## 📦 Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| expo | ~51.0.0 | Framework principal |
| @react-navigation/native | ^6 | Navigation |
| @react-navigation/stack | ^6 | Navigation en pile |
| @react-navigation/bottom-tabs | ^6 | Barre d'onglets |
| react-native-safe-area-context | 4.10.1 | Zones sécurisées |
| react-native-qrcode-svg | ^6.3.2 | QR Code |

## 🔗 Connexion Backend (Production)

Pour connecter l'app à un vrai backend, remplacer les mock data dans `data.js` par des appels API :

```js
// Exemple avec fetch
const fetchUser = async () => {
  const response = await fetch('https://api.chaghaf.ma/user/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};
```

---

**Chaghaf Community** · Agadir, Maroc · chaghaf.community
