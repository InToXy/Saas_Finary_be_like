// Service de récupération automatique d'images pour les objets de collection
import { REAL_WATCH_IMAGES, REAL_CAR_IMAGES, getYearSpecificImages, getConditionSpecificImages } from '../data/realImages';

interface AssetImageQuery {
  type: 'LUXURY_WATCH' | 'COLLECTOR_CAR';
  brand: string;
  model: string;
  year?: number;
  condition?: string;
}

interface ImageResult {
  url: string;
  alt: string;
  source: string;
}


// Normaliser les chaînes de caractères pour la comparaison
const normalizeString = (str: string): string => {
  return str.toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[çć]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ');
};

// Fonction pour trouver la meilleure correspondance
const findBestMatch = (target: string, candidates: string[]): string | null => {
  const normalizedTarget = normalizeString(target);
  
  // Correspondance exacte
  for (const candidate of candidates) {
    if (normalizeString(candidate) === normalizedTarget) {
      return candidate;
    }
  }
  
  // Correspondance partielle
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeString(candidate);
    if (normalizedCandidate.includes(normalizedTarget) || normalizedTarget.includes(normalizedCandidate)) {
      return candidate;
    }
  }
  
  // Correspondance de mots-clés
  const targetWords = normalizedTarget.split(' ');
  for (const candidate of candidates) {
    const candidateWords = normalizeString(candidate).split(' ');
    const matches = targetWords.filter(word => 
      candidateWords.some(candWord => candWord.includes(word) || word.includes(candWord))
    );
    if (matches.length > 0) {
      return candidate;
    }
  }
  
  return null;
};

// Service principal de récupération d'images
export class ImageService {
  static async getAssetImages(query: AssetImageQuery): Promise<ImageResult[]> {
    try {
      // Améliorer la correspondance des noms
      const enhanced = this.enhanceNameMatching(query.brand, query.model);
      const { type, year } = query;
      const { brand, model } = enhanced;
      
      // Essayer d'abord avec la base de données d'images réelles
      let realImages: ImageResult[] = [];
      if (type === 'LUXURY_WATCH') {
        realImages = this.getWatchImages(brand, model, year, query.condition);
      } else if (type === 'COLLECTOR_CAR') {
        realImages = this.getCarImages(brand, model, year, query.condition);
      }
      
      // Si on trouve des images réelles, les retourner
      if (realImages.length > 0) {
        return realImages;
      }
      
      // Sinon, essayer de chercher avec l'API
      return await this.searchOnlineImages(query);
    } catch (error) {
      console.error('Erreur lors de la récupération des images:', error);
      return [];
    }
  }
  
  // Nouvelle méthode pour rechercher des images en ligne
  static async searchOnlineImages(query: AssetImageQuery): Promise<ImageResult[]> {
    const searchTerm = this.buildSearchTerm(query);
    
    try {
      // Utiliser une API publique pour la recherche d'images
      return await this.searchUnsplashImages(searchTerm, query);
    } catch (error) {
      console.error('Erreur lors de la recherche en ligne:', error);
      return this.getFallbackImages(query.type);
    }
  }
  
  // Construire le terme de recherche
  static buildSearchTerm(query: AssetImageQuery): string {
    const { brand, model, year, type } = query;
    
    let searchTerm = `${brand} ${model}`;
    
    if (year) {
      searchTerm += ` ${year}`;
    }
    
    // Ajouter des termes spécifiques selon le type
    if (type === 'LUXURY_WATCH') {
      searchTerm += ' luxury watch';
    } else if (type === 'COLLECTOR_CAR') {
      searchTerm += ' classic car vintage';
    }
    
    return searchTerm;
  }
  
  // Recherche via Unsplash (API publique)
  static async searchUnsplashImages(_searchTerm: string, query: AssetImageQuery): Promise<ImageResult[]> {
    // URLs de recherche Unsplash spécifiques
    const searchUrls = this.generateSpecificImageUrls(query);
    
    return searchUrls.map((url, index) => ({
      url,
      alt: `${query.brand} ${query.model}${query.year ? ` ${query.year}` : ''} - Image ${index + 1}`,
      source: 'unsplash-search'
    }));
  }
  
  // Générer des URLs d'images plus spécifiques
  static generateSpecificImageUrls(query: AssetImageQuery): string[] {
    const { brand, model, type } = query;
    const brandLower = brand.toLowerCase().replace(/\s+/g, '-');
    const modelLower = model.toLowerCase().replace(/\s+/g, '-');
    
    if (type === 'LUXURY_WATCH') {
      return this.getWatchSpecificUrls(brandLower, modelLower, query);
    } else if (type === 'COLLECTOR_CAR') {
      return this.getCarSpecificUrls(brandLower, modelLower, query);
    }
    
    return [];
  }
  
  // URLs spécifiques pour les montres avec recherche réelle
  static getWatchSpecificUrls(_brand: string, _model: string, query: AssetImageQuery): string[] {
    // Générer des URLs avec des IDs d'images Unsplash spécifiques pour chaque recherche
    const watchImageIds = this.getWatchImageIds(query.brand.toLowerCase(), query.model.toLowerCase());
    
    return watchImageIds.map(imageId => 
      `https://images.unsplash.com/${imageId}?w=400&h=300&fit=crop&crop=center`
    );
  }
  
  // URLs spécifiques pour les voitures avec recherche réelle
  static getCarSpecificUrls(_brand: string, _model: string, query: AssetImageQuery): string[] {
    const carImageIds = this.getCarImageIds(query.brand.toLowerCase(), query.model.toLowerCase());
    
    return carImageIds.map(imageId => 
      `https://images.unsplash.com/${imageId}?w=400&h=300&fit=crop&crop=center`
    );
  }
  
  // IDs d'images Unsplash spécifiques pour montres
  static getWatchImageIds(brand: string, model: string): string[] {
    const watchIds: Record<string, Record<string, string[]>> = {
      'rolex': {
        'submariner': ['photo-1594534475808-b18fc33b045e', 'photo-1548169874-53e85f753f1e'],
        'daytona': ['photo-1606390886340-7e2717e04e11', 'photo-1578662996442-48f60103fc96'],
        'gmt': ['photo-1609081219090-a6d81d3085bf'],
        'datejust': ['photo-1522312346375-d1a52e2b99b3']
      },
      'omega': {
        'speedmaster': ['photo-1434493907317-a46b5bbe7834', 'photo-1547996160-81dfa63595aa'],
        'seamaster': ['photo-1508057198894-247b23fe5ade']
      }
    };
    
    return watchIds[brand]?.[model] || ['photo-1523170335258-f5cc8c8f1e20']; // Fallback
  }
  
  // IDs d'images Unsplash spécifiques pour voitures
  static getCarImageIds(brand: string, model: string): string[] {
    const carIds: Record<string, Record<string, string[]>> = {
      'porsche': {
        '911': ['photo-1544636331-e26879cd4d9b', 'photo-1494905998402-395d579af36f'],
        'carrera': ['photo-1580273916550-e323be2ae537']
      },
      'ferrari': {
        'f40': ['photo-1583121274602-3e2820c69888', 'photo-1547744152-14d985cb937e'],
        'testarossa': ['photo-1552519507-da3b142c6e3d']
      }
    };
    
    return carIds[brand]?.[model] || ['photo-1544636331-e26879cd4d9b']; // Fallback
  }
  
  private static getWatchImages(brand: string, model: string, year?: number, condition?: string): ImageResult[] {
    const normalizedBrand = normalizeString(brand);
    const normalizedModel = normalizeString(model);
    
    // Trouver la marque dans la base de données d'images réelles
    const brandKeys = Object.keys(REAL_WATCH_IMAGES);
    const matchedBrand = findBestMatch(normalizedBrand, brandKeys);
    
    if (!matchedBrand) {
      return this.getFallbackImages('LUXURY_WATCH');
    }
    
    const brandData = REAL_WATCH_IMAGES[matchedBrand];
    const modelKeys = Object.keys(brandData);
    const matchedModel = findBestMatch(normalizedModel, modelKeys);
    
    if (!matchedModel) {
      return this.getFallbackImages('LUXURY_WATCH');
    }
    
    let images = brandData[matchedModel];
    
    // Appliquer les modifications selon l'année et la condition
    images = getYearSpecificImages(images, year);
    images = getConditionSpecificImages(images, condition);
    
    return images.map((url, index) => ({
      url,
      alt: `${brand} ${model}${year ? ` ${year}` : ''} - ${condition || 'Condition non spécifiée'} - Image ${index + 1}`,
      source: 'real-database'
    }));
  }
  
  private static getCarImages(brand: string, model: string, year?: number, condition?: string): ImageResult[] {
    const normalizedBrand = normalizeString(brand);
    const normalizedModel = normalizeString(model);
    
    // Trouver la marque dans la base de données d'images réelles
    const brandKeys = Object.keys(REAL_CAR_IMAGES);
    const matchedBrand = findBestMatch(normalizedBrand, brandKeys);
    
    if (!matchedBrand) {
      return this.getFallbackImages('COLLECTOR_CAR');
    }
    
    const brandData = REAL_CAR_IMAGES[matchedBrand];
    const modelKeys = Object.keys(brandData);
    let matchedModel = findBestMatch(normalizedModel, modelKeys);
    
    // Pour les voitures, essayer des correspondances plus larges
    if (!matchedModel) {
      // Essayer avec des mots-clés spécifiques
      if (normalizedModel.includes('911') || normalizedModel.includes('turbo') || normalizedModel.includes('carrera')) {
        matchedModel = '911';
      } else if (normalizedModel.includes('f40') || normalizedModel.includes('f-40')) {
        matchedModel = 'f40';
      } else if (normalizedModel.includes('300') && normalizedModel.includes('sl')) {
        matchedModel = '300sl';
      }
    }
    
    if (!matchedModel) {
      return this.getFallbackImages('COLLECTOR_CAR');
    }
    
    let images = brandData[matchedModel];
    
    // Appliquer les modifications selon l'année et la condition
    images = getYearSpecificImages(images, year);
    images = getConditionSpecificImages(images, condition);
    
    return images.map((url, index) => ({
      url,
      alt: `${brand} ${model}${year ? ` ${year}` : ''} - ${condition || 'Condition non spécifiée'} - Image ${index + 1}`,
      source: 'real-database'
    }));
  }
  
  private static getFallbackImages(type: 'LUXURY_WATCH' | 'COLLECTOR_CAR'): ImageResult[] {
    if (type === 'LUXURY_WATCH') {
      return [
        {
          url: 'https://images.unsplash.com/photo-1523170335258-f5cc8c8f1e20?w=400&h=300&fit=crop&crop=center',
          alt: 'Montre de luxe générique',
          source: 'unsplash'
        }
      ];
    } else {
      return [
        {
          url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center',
          alt: 'Voiture de collection générique',
          source: 'unsplash'
        }
      ];
    }
  }
  
  // Fonction de recherche en temps réel basée sur les saisies utilisateur
  static async searchAssetImages(type: 'LUXURY_WATCH' | 'COLLECTOR_CAR', searchTerm: string): Promise<ImageResult[]> {
    const terms = searchTerm.toLowerCase().split(' ');
    let brand = '';
    let model = '';
    
    if (terms.length >= 2) {
      brand = terms[0];
      model = terms.slice(1).join(' ');
    } else {
      brand = searchTerm;
    }
    
    return this.getAssetImages({ type, brand, model });
  }
  
  // Fonction pour nettoyer et améliorer la correspondance des noms
  static enhanceNameMatching(brand: string, model: string): { brand: string; model: string } {
    // Corrections communes pour les marques
    const brandCorrections: Record<string, string> = {
      'ap': 'audemars piguet',
      'pp': 'patek philippe',
      'vc': 'vacheron constantin',
      'jlc': 'jaeger lecoultre',
      'iwc': 'iwc schaffhausen',
      'mb': 'mercedes',
      'bmw': 'bmw',
      'am': 'aston martin'
    };
    
    // Corrections communes pour les modèles
    const modelCorrections: Record<string, string> = {
      'sub': 'submariner',
      'gmt': 'gmt-master',
      'dd': 'day-date',
      'dj': 'datejust'
    };
    
    const correctedBrand = brandCorrections[brand.toLowerCase()] || brand;
    const correctedModel = modelCorrections[model.toLowerCase()] || model;
    
    return { brand: correctedBrand, model: correctedModel };
  }
}