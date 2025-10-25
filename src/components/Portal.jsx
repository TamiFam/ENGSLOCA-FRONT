import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  const [portalElement, setPortalElement] = useState(null);

  useEffect(() => {
    // Создаем элемент для портала
    const element = document.createElement('div');
    element.id = 'portal-root';
    document.body.appendChild(element);
    setPortalElement(element);

    // Убираем скролл у body когда модалка открыта
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.removeChild(element);
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!portalElement) return null;

  return createPortal(children, portalElement);
}