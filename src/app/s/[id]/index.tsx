import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '../../../screens/ChatScreen';

export default function SessionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatScreen sessionId={id} />;
}
