import React from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Wordmark } from '../components/Wordmark';
import { Text } from '../design-system/internal/Text';
import { SessionListPane } from '../components/session-list/SessionListPane';
import { Button, ErrorLine, IconButton, TextInput, colors, em, fontSize, layout, spacing, tracking } from '../design-system';
import { useSessionsStore } from '../state/SessionsContext';

export function SessionListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useSessionsStore();
  const [searchActive, setSearchActive] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const online = store.state.net === 'online';

  function openSession(id: string) {
    router.push(`/s/${id}`);
  }

  function startHandsFree() {
    const id = store.createSession();
    router.push(`/s/${id}/voice`);
  }

  function cancelSearch() {
    setSearchActive(false);
    setQuery('');
  }

  const showBottomBar = !searchActive && store.sortedSessions.length > 0;

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? insets.top : 0 }}>
      {searchActive ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sp3,
            padding: spacing.sp4,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderDefault,
          }}
        >
          <View style={{ flex: 1 }}>
            <TextInput value={query} onChange={setQuery} prompt="/" placeholder="search sessions" autoFocus />
          </View>
          <Pressable onPress={cancelSearch}>
            <Text style={{ color: colors.textBody, fontSize: fontSize.small, fontFamily: 'IBMPlexMono_600SemiBold' }}>{'>'} cancel</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View
            style={{
              height: layout.headerH,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.sp4,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderDefault,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp3 }}>
              <Wordmark size={fontSize.timer} />
              <Pressable onPress={store.toggleNet} accessibilityRole="button" accessibilityLabel="Toggle network status (demo)">
                <Text
                  style={{
                    color: online ? colors.statusOk : colors.textDisabled,
                    fontSize: fontSize.label,
                    letterSpacing: em(fontSize.label, tracking.label),
                    textTransform: 'uppercase',
                  }}
                >
                  {online ? '● ONLINE' : '○ OFFLINE'}
                </Text>
              </Pressable>
            </View>
            <IconButton icon="wave" label="Talk hands-free" onClick={startHandsFree} variant="ghost" />
          </View>

          {!online && (
            <View style={{ padding: spacing.sp4 }}>
              <ErrorLine onRetry={store.retryReconnect}>
                offline · showing cached sessions. Messages you send will wait here.
              </ErrorLine>
            </View>
          )}

          <Pressable onPress={() => setSearchActive(true)} style={{ padding: spacing.sp4, borderBottomWidth: 1, borderBottomColor: colors.borderDefault }}>
            <View pointerEvents="none">
              <TextInput value="" onChange={() => {}} prompt="/" placeholder="search sessions" />
            </View>
          </Pressable>
        </>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <SessionListPane variant="mobile" query={searchActive ? query : ''} onOpenSession={openSession} onClearSearch={cancelSearch} />
      </ScrollView>

      {showBottomBar && (
        <View style={{ padding: 10, borderTopWidth: 1, borderTopColor: colors.borderDefault }}>
          <Button glyph="[+]" fullWidth onClick={() => router.push('/s/new')}>
            NEW SESSION
          </Button>
        </View>
      )}
    </View>
  );
}
