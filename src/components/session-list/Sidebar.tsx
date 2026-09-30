import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Wordmark } from '../Wordmark';
import { Text } from '../../design-system/internal/Text';
import { Button, TextInput, colors, layout, spacing, fontSize } from '../../design-system';
import { webCursor } from '../../design-system/internal/useInteractiveState';
import { SessionListPane } from './SessionListPane';

export interface SidebarProps {
  activeSessionId?: string;
}

/** Persistent 280px desktop session list — header + search + grouped rows + settings link. */
export function Sidebar({ activeSessionId }: SidebarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  return (
    <View style={{ width: layout.sidebarW, borderRightWidth: 1, borderRightColor: colors.borderDefault, backgroundColor: colors.surfacePanel }}>
      <View
        style={{
          height: layout.headerH,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.sp3,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderDefault,
        }}
      >
        <Wordmark size={fontSize.heading} />
        <Button variant="secondary" size="sm" glyph="[+]" onClick={() => router.push('/s/new')}>
          NEW
        </Button>
      </View>

      <View style={{ padding: spacing.sp3 }}>
        <TextInput value={query} onChange={setQuery} prompt="/" placeholder="search sessions" />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <SessionListPane
          variant="sidebar"
          query={query}
          activeSessionId={activeSessionId}
          onOpenSession={(id) => router.push(`/s/${id}`)}
          onClearSearch={() => setQuery('')}
        />
      </ScrollView>

      <Pressable
        onPress={() => {}}
        {...(webCursor('pointer') as any)}
        style={{ padding: spacing.sp3, borderTopWidth: 1, borderTopColor: colors.borderDefault }}
      >
        <Text style={{ color: colors.textMeta, fontSize: fontSize.small }}>C:\&gt; settings</Text>
      </Pressable>
    </View>
  );
}
