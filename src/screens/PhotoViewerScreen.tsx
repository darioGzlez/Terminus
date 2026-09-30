import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { PhotoViewer, Toast, spacing } from '../design-system';
import { useSessionsStore } from '../state/SessionsContext';
import { timeHHMMSS } from '../data/format';

export interface PhotoViewerScreenProps {
  sessionId: string;
  msgId: string;
  index: number;
}

export function PhotoViewerScreen({ sessionId, msgId, index }: PhotoViewerScreenProps) {
  const router = useRouter();
  const store = useSessionsStore();
  const [i, setI] = React.useState(index);
  const [toast, setToast] = React.useState<string | null>(null);

  const message = (store.state.messages[sessionId] ?? []).find((m) => m.id === msgId);
  const photos = message?.photos ?? [];

  function flash(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 2000);
  }

  if (!message || photos.length === 0) {
    router.back();
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <PhotoViewer
        photos={photos}
        index={i}
        from={message.role}
        time={timeHHMMSS(message.createdAt)}
        onClose={() => router.back()}
        onIndexChange={setI}
        onSave={() => flash('Saved to gallery')}
        onShare={() => flash('Shared')}
        onAsk={() => router.push(`/s/${sessionId}`)}
      />
      {toast && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 90, alignItems: 'center', paddingHorizontal: spacing.sp4 }}>
          <View style={{ maxWidth: 420, width: '100%' }}>
            <Toast kind="ok">{toast}</Toast>
          </View>
        </View>
      )}
    </View>
  );
}
