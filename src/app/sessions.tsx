import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionListScreen } from '../screens/SessionListScreen';
import { layout } from '../design-system';
import { useSessionsStore } from '../state/SessionsContext';

/** "/" on mobile is the session list. On desktop the list becomes the sidebar, so this route
 * just forwards to the last active session (or a fresh one) as soon as it mounts. */
export default function SessionsRoute() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const store = useSessionsStore();
  const isDesktop = width >= layout.bpDesktop;

  React.useEffect(() => {
    if (!isDesktop) return;
    if (store.sortedSessions.length === 0) {
      router.replace('/s/new');
      return;
    }
    const last = store.sortedSessions.reduce((a, b) => (b.updatedAt > a.updatedAt ? b : a));
    router.replace(`/s/${last.id}`);
  }, [isDesktop, router, store.sortedSessions]);

  if (isDesktop) return null;
  return <SessionListScreen />;
}
