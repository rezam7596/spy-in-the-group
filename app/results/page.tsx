'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerSession } from '../utils/playerSession';
import ResultsScreen from '../components/ResultsScreen';

export default function ResultsPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPlayerSession();
    if (!session) {
      router.push('/');
      return;
    }

    setRoomId(session.roomId);
    setLoading(false);
  }, [router]);

  if (loading || !roomId) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return <ResultsScreen roomId={roomId} />;
}
