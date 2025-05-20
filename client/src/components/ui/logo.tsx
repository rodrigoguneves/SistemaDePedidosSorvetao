
import React from "react";

export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <svg width="58" height="40" viewBox="0 0 58 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.8506 12.3933C23.2499 12.3933 29.2499 9.64544 29.2499 6.27107C29.2499 2.8967 23.2499 0.148834 15.8506 0.148834C8.45129 0.148834 2.4513 2.8967 2.4513 6.27107C2.4513 9.64544 8.45129 12.3933 15.8506 12.3933Z" fill="#E73664"/>
        <path d="M29.0566 7.62891C29.0566 11.0033 23.0566 13.7511 15.6573 13.7511C8.25796 13.7511 2.25797 11.0033 2.25797 7.62891" stroke="#E73664" strokeWidth="1.5"/>
        <path d="M29.0566 12.4922C29.0566 15.8666 23.0566 18.6144 15.6573 18.6144C8.25796 18.6144 2.25797 15.8666 2.25797 12.4922" stroke="#E73664" strokeWidth="1.5"/>
        <path d="M29.0566 17.7344C29.0566 21.1087 23.0566 23.8566 15.6573 23.8566C8.25796 23.8566 2.25797 21.1087 2.25797 17.7344" stroke="#E73664" strokeWidth="1.5"/>
        <path d="M35.4419 38.0967H38.4126V35.9912H39.1822C40.6685 35.9912 41.7785 34.9735 41.7785 33.4529C41.7785 31.9868 40.7339 30.8696 39.2476 30.8696H35.4419V38.0967ZM38.4126 33.9014V32.9592H38.8249C39.3674 32.9592 39.6814 33.2077 39.6814 33.4374C39.6814 33.6671 39.3674 33.9014 38.8249 33.9014H38.4126Z" fill="#E73664"/>
        <path d="M43.7764 38.0967H46.7471V36.2662H48.0588V34.345H46.7471V32.7531H48.6179V30.8696H43.7764V38.0967Z" fill="#E73664"/>
        <path d="M52.3346 38.2482C54.5855 38.2482 56.0719 36.9068 56.0719 34.4913C56.0719 32.0758 54.5693 30.7344 52.3346 30.7344C50.0999 30.7344 48.5974 32.0758 48.5974 34.4913C48.5974 36.9068 50.0837 38.2482 52.3346 38.2482ZM52.3346 36.0676C51.6459 36.0676 51.3319 35.4316 51.3319 34.4913C51.3319 33.551 51.6459 32.9149 52.3346 32.9149C53.0234 32.9149 53.3375 33.551 53.3375 34.4913C53.3375 35.4316 53.0234 36.0676 52.3346 36.0676Z" fill="#E73664"/>
      </svg>
      <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 'bold', color: '#E73664' }}>
        Sorvetão
      </span>
    </div>
  );
}
import React, { useState, useEffect } from 'react';

export const Logo = ({ className = "h-10" }: { className?: string }) => {
  const [logoSrc, setLogoSrc] = useState<string>('/assets/logo.png');
  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    const checkImage = async (src: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
    };

    const tryLoadingImage = async () => {
      const paths = [
        '/assets/logo.png',
        '/logo.png',
        './logo.png',
        './attached_assets/logo.png',
        '/attached_assets/logo.png',
        '../attached_assets/logo.png'
      ];
      
      console.log('Tentando encontrar a imagem do logo nos seguintes caminhos:');
      
      for (const path of paths) {
        const exists = await checkImage(path);
        if (exists) {
          setLogoSrc(path);
          setLogoError(false);
          return;
        } else {
          console.log(`Imagem falhou ao carregar em: ${path}`);
        }
      }
      
      setLogoError(true);
    };

    tryLoadingImage();
  }, []);

  if (logoError) {
    // Fallback para um logo de texto se a imagem não puder ser carregada
    return (
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
          S
        </div>
        <span className="ml-2 font-bold text-primary text-xl">Sorvetão</span>
        <span className="text-xs text-gray-500 ml-1 mt-auto mb-1">desde 1990</span>
      </div>
    );
  }

  return <img src={logoSrc} alt="Sorvetão" className={className} />;
};
