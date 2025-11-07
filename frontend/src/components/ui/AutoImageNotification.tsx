import { useState, useEffect } from 'react';
import { CheckCircle, Wand2 } from 'lucide-react';

interface AutoImageNotificationProps {
  show: boolean;
  imagesCount: number;
  brand: string;
  model: string;
}

export function AutoImageNotification({ show, imagesCount, brand, model }: AutoImageNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && imagesCount > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000); // Disparaît après 4 secondes

      return () => clearTimeout(timer);
    }
  }, [show, imagesCount]);

  if (!isVisible || imagesCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-1">
              <Wand2 className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Images trouvées !
              </p>
            </div>
            <p className="text-xs text-green-600">
              {imagesCount} image{imagesCount > 1 ? 's' : ''} récupérée{imagesCount > 1 ? 's' : ''} pour <br />
              <span className="font-medium">{brand} {model}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}