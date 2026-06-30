import { useState, useEffect } from 'react';

export function useLogo() {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/brasao-nazarezinho.png');
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(blob);
      });
      setLogo(dataUrl);
    }
    load();
  }, []);

  return { logo };
}
