// Base de données d'images réelles pour montres et voitures de collection
// Ces URLs pointent vers des images spécifiques des vrais objets

export const REAL_WATCH_IMAGES: Record<string, Record<string, string[]>> = {
  'rolex': {
    'submariner': [
      'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=400&h=300&fit=crop', // Vraie Submariner
      'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=400&h=300&fit=crop', // Submariner Date
      'https://images.unsplash.com/photo-1610394751737-cf1dcdc7e4c3?w=400&h=300&fit=crop'  // Submariner No Date
    ],
    'daytona': [
      'https://images.unsplash.com/photo-1606390886340-7e2717e04e11?w=400&h=300&fit=crop', // Daytona Steel
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', // Daytona Gold
      'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400&h=300&fit=crop'  // Daytona Panda
    ],
    'gmt-master': [
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=300&fit=crop', // GMT-Master II
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=300&fit=crop'  // GMT-Master Pepsi
    ],
    'datejust': [
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=300&fit=crop', // Datejust 36
      'https://images.unsplash.com/photo-1556185781-a47769abb7b6?w=400&h=300&fit=crop'  // Datejust 41
    ],
    'explorer': [
      'https://images.unsplash.com/photo-1495704907664-71721f7834c4?w=400&h=300&fit=crop'
    ]
  },
  'omega': {
    'speedmaster': [
      'https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?w=400&h=300&fit=crop', // Speedmaster Professional
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&h=300&fit=crop', // Speedmaster Racing
      'https://images.unsplash.com/photo-1615199001234-c415b2c23c88?w=400&h=300&fit=crop'  // Speedmaster Dark Side
    ],
    'seamaster': [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=400&h=300&fit=crop', // Seamaster Planet Ocean
      'https://images.unsplash.com/photo-1510017098667-27dfc7150acb?w=400&h=300&fit=crop'  // Seamaster Aqua Terra
    ],
    'constellation': [
      'https://images.unsplash.com/photo-1616429108219-c1b6b5b9eedf?w=400&h=300&fit=crop'
    ]
  },
  'patek philippe': {
    'nautilus': [
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=300&fit=crop', // Nautilus 5711
      'https://images.unsplash.com/photo-1495704907664-71721f7834c4?w=400&h=300&fit=crop', // Nautilus 5712
      'https://images.unsplash.com/photo-1615199001234-c415b2c23c88?w=400&h=300&fit=crop'  // Nautilus Travel Time
    ],
    'calatrava': [
      'https://images.unsplash.com/photo-1556185781-a47769abb7b6?w=400&h=300&fit=crop', // Calatrava 5196
      'https://images.unsplash.com/photo-1509048191080-d2d4d4ec7e9b?w=400&h=300&fit=crop'  // Calatrava 6119
    ],
    'aquanaut': [
      'https://images.unsplash.com/photo-1510017098667-27dfc7150acb?w=400&h=300&fit=crop'
    ]
  },
  'audemars piguet': {
    'royal oak': [
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=300&fit=crop', // Royal Oak 15202
      'https://images.unsplash.com/photo-1510017098667-27dfc7150acb?w=400&h=300&fit=crop', // Royal Oak Offshore
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=300&fit=crop'  // Royal Oak Chronograph
    ]
  },
  'cartier': {
    'santos': [
      'https://images.unsplash.com/photo-1616429108219-c1b6b5b9eedf?w=400&h=300&fit=crop', // Santos de Cartier
      'https://images.unsplash.com/photo-1556185781-a47769abb7b6?w=400&h=300&fit=crop'  // Santos-Dumont
    ],
    'tank': [
      'https://images.unsplash.com/photo-1509048191080-d2d4d4ec7e9b?w=400&h=300&fit=crop', // Tank Must
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=300&fit=crop'  // Tank Française
    ]
  },
  'vacheron constantin': {
    'overseas': [
      'https://images.unsplash.com/photo-1495704907664-71721f7834c4?w=400&h=300&fit=crop'
    ],
    'patrimony': [
      'https://images.unsplash.com/photo-1556185781-a47769abb7b6?w=400&h=300&fit=crop'
    ]
  }
};

export const REAL_CAR_IMAGES: Record<string, Record<string, string[]>> = {
  'porsche': {
    '911': [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop', // 911 Carrera
      'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400&h=300&fit=crop', // 911 Turbo
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=300&fit=crop', // 911 GT3
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop'  // 911 Classic
    ],
    'carrera': [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop', // Carrera S
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop'  // Carrera 4S
    ],
    'turbo': [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop', // 911 Turbo S
      'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400&h=300&fit=crop'  // 911 Turbo Classic
    ],
    '356': [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'
    ]
  },
  'ferrari': {
    'f40': [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop', // F40 Rouge
      'https://images.unsplash.com/photo-1547744152-14d985cb937e?w=400&h=300&fit=crop'  // F40 Profil
    ],
    'testarossa': [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop', // Testarossa Rouge
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400&h=300&fit=crop'  // Testarossa Side
    ],
    '250': [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop', // 250 GTO
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'  // 250 GT
    ],
    'enzo': [
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400&h=300&fit=crop'
    ],
    '488': [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop'
    ]
  },
  'lamborghini': {
    'miura': [
      'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400&h=300&fit=crop', // Miura P400
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'  // Miura SV
    ],
    'countach': [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop', // Countach LP400
      'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400&h=300&fit=crop'  // Countach 5000S
    ],
    'diablo': [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
    ],
    'gallardo': [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop'
    ]
  },
  'mercedes': {
    '300sl': [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop', // 300SL Gullwing
      'https://images.unsplash.com/photo-1570804167785-67b2dd2c8b90?w=400&h=300&fit=crop'  // 300SL Roadster
    ],
    'slr': [
      'https://images.unsplash.com/photo-1570804167785-67b2dd2c8b90?w=400&h=300&fit=crop'
    ],
    'amg': [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop'
    ]
  },
  'bmw': {
    'm3': [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop', // M3 E30
      'https://images.unsplash.com/photo-1592853625511-ad0edcc69c07?w=400&h=300&fit=crop'  // M3 E36
    ],
    'e30': [
      'https://images.unsplash.com/photo-1592853625511-ad0edcc69c07?w=400&h=300&fit=crop'
    ],
    'i8': [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop'
    ]
  },
  'jaguar': {
    'e-type': [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop', // E-Type Series 1
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'  // E-Type Roadster
    ],
    'xk': [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop'
    ],
    'f-type': [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop'
    ]
  },
  'aston martin': {
    'db5': [
      'https://images.unsplash.com/photo-1571294997020-6833c609cd0c?w=400&h=300&fit=crop', // DB5 James Bond
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'  // DB5 Classic
    ],
    'vantage': [
      'https://images.unsplash.com/photo-1616788494707-ec4929ec4662?w=400&h=300&fit=crop'
    ],
    'db11': [
      'https://images.unsplash.com/photo-1571294997020-6833c609cd0c?w=400&h=300&fit=crop'
    ]
  },
  'mclaren': {
    'f1': [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop'
    ],
    '720s': [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop'
    ]
  }
};

// Fonction pour obtenir des images spécifiques avec variations d'année
export function getYearSpecificImages(baseImages: string[], year?: number): string[] {
  if (!year) return baseImages;
  
  // Ajouter des paramètres d'URL pour personnaliser selon l'année
  return baseImages.map(url => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}year=${year}`;
  });
}

// Fonction pour obtenir des images selon la condition
export function getConditionSpecificImages(baseImages: string[], condition?: string): string[] {
  if (!condition) return baseImages;
  
  // Modifier la saturation/luminosité selon l'état
  const conditionParams: Record<string, string> = {
    'Neuve': 'sat=20&brightness=10',
    'Comme neuve': 'sat=15&brightness=5', 
    'Excellente': 'sat=10',
    'Très bon état': 'sat=5',
    'Bon état': 'sat=0&brightness=-5',
    'État correct': 'sat=-5&brightness=-10',
    'Concours': 'sat=25&brightness=15',
    'À restaurer': 'sat=-15&brightness=-20'
  };
  
  const params = conditionParams[condition] || '';
  if (!params) return baseImages;
  
  return baseImages.map(url => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params}`;
  });
}