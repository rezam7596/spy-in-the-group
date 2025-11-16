'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerSession } from '../utils/playerSession';
import PlayerRoleReveal from '../components/PlayerRoleReveal';
import { Language } from '../types/game';

export default function RoleRevealPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPlayerSession();
    if (!session) {
      router.push('/');
      return;
    }

    setRoomId(session.roomId);

    // Fetch room settings to get language
    fetch(`/api/rooms/${session.roomId}`)
      .then(res => res.json())
      .then(data => {
        if (data.room?.settings?.language) {
          setLanguage(data.room.settings.language);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
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

  return <PlayerRoleReveal roomId={roomId} language={language} />;
}
