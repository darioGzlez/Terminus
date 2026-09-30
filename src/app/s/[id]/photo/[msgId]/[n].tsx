import { useLocalSearchParams } from 'expo-router';
import { PhotoViewerScreen } from '../../../../../screens/PhotoViewerScreen';

export default function PhotoRoute() {
  const { id, msgId, n } = useLocalSearchParams<{ id: string; msgId: string; n: string }>();
  return <PhotoViewerScreen sessionId={id} msgId={msgId} index={Number(n) || 0} />;
}
