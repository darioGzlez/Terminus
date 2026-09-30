import { useLocalSearchParams } from 'expo-router';
import { HandsFreeScreen } from '../../../screens/HandsFreeScreen';

export default function VoiceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <HandsFreeScreen sessionId={id} />;
}
