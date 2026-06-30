import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

type GuardType = 'admin' | 'any';
type GuardStatus = 'loading' | 'allowed' | 'denied' | 'unauthenticated';

export function useRouteGuard(type: GuardType = 'any', secretariaId?: string): GuardStatus {
  const router = useRouter();
  const [status, setStatus] = useState<GuardStatus>('loading');

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.replace('/');
      setStatus('unauthenticated');
      return;
    }

    if (type === 'admin' && !authService.isAdmin()) {
      setStatus('denied');
      return;
    }

    if (type === 'any' && !authService.isAdmin() && secretariaId) {
      const userSecretariaId = authService.getSecretariaId();
      if (userSecretariaId && userSecretariaId !== secretariaId) {
        router.replace(`/mesesSecretaria/${userSecretariaId}`);
        setStatus('unauthenticated');
        return;
      }
    }

    setStatus('allowed');
  }, []);

  return status;
}
