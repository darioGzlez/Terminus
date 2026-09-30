import React from 'react';
import { ScrollView, View } from 'react-native';
import {
  AgentMessage,
  AttachmentTray,
  Button,
  Checkbox,
  Chip,
  CodeBlock,
  Composer,
  CRTScreen,
  ErrorLine,
  HandsFreePanel,
  IconButton,
  ImageFrame,
  Keycap,
  MessageActions,
  ProgressBar,
  Radio,
  RecordingBar,
  Spinner,
  StatusBar,
  Switch,
  SystemLine,
  TextInput,
  ThinkingIndicator,
  Toast,
  UserMessage,
  VoiceNote,
  colors,
  fontSize,
  spacing,
} from '../design-system';
import { Text } from '../design-system/internal/Text';
import { Cursor } from '../design-system/components/core/Cursor';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sp4 }}>
      <SystemLine>{title}</SystemLine>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sp4, alignItems: 'flex-start' }}>{children}</View>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sp3, alignItems: 'center' }}>{children}</View>;
}

/**
 * `/design-system` — catalog reproducing every screenshot in docs/components/*.md with
 * the same example data, grouped by section, for 1:1 visual verification.
 */
export function DesignSystemScreen() {
  const [checked, setChecked] = React.useState(true);
  const [stripLocation, setStripLocation] = React.useState(false);
  const [voice, setVoice] = React.useState<'warm' | 'crisp'>('warm');
  const [handsFreeWake, setHandsFreeWake] = React.useState(true);
  const [chip, setChip] = React.useState<'describe' | 'translate' | 'summarize'>('describe');
  const [focusMeText, setFocusMeText] = React.useState("what's in this photo");
  const [composerText, setComposerText] = React.useState('');
  const [attachments, setAttachments] = React.useState([{ name: 'IMG_0142.JPG' }, { name: 'IMG_0143.JPG' }]);
  const [playingUser, setPlayingUser] = React.useState(false);
  const [playingAgent, setPlayingAgent] = React.useState(true);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.sp6, gap: spacing.sp8 }}>
      <Section title="Core">
        <Row>
          <Button glyph="[>]">Send</Button>
          <Button variant="secondary" glyph="[+]">
            Attach
          </Button>
          <Button variant="ghost">cancel</Button>
          <Button variant="danger" glyph="[x]">
            Delete
          </Button>
          <Button disabled glyph="[>]">
            Send
          </Button>
          <Button loading>Sending</Button>
        </Row>
        <Row>
          <IconButton icon="mic" label="Record voice note" variant="primary" active />
          <IconButton icon="camera" label="Take photo" variant="outline" />
          <IconButton icon="attach" label="Attach photo" variant="ghost" />
          <IconButton icon="speaker" label="Play reply" variant="ghost" size="sm" />
          <IconButton icon="stop" label="Stop recording" variant="rec" />
          <IconButton icon="send" label="Send" variant="primary" />
          <Button variant="secondary" icon="image">
            Gallery
          </Button>
        </Row>
        <Row>
          <Spinner label="working" />
          <ProgressBar value={58} />
          <Keycap>ESC</Keycap>
          <Keycap>⏎</Keycap>
          <Keycap>SPACE</Keycap>
          <Text style={{ color: colors.textBody, fontSize: fontSize.body }}>
            prompt
            <Cursor />
          </Text>
        </Row>
      </Section>

      <Section title="Forms">
        <View style={{ gap: spacing.sp3, width: 260 }}>
          <TextInput label="Focus me" value={focusMeText} onChange={setFocusMeText} placeholder="what's in this photo" />
          <TextInput label="Error" value="IMG_2231.HEIC" error="file exceeds 20 MB limit" />
          <TextInput label="Disabled" placeholder="agent is speaking…" disabled />
        </View>
        <View style={{ gap: spacing.sp3 }}>
          <Row>
            <Checkbox checked={checked} onChange={setChecked} label="Auto-play agent voice" />
          </Row>
          <Row>
            <Checkbox checked={stripLocation} onChange={setStripLocation} label="Strip photo location" />
          </Row>
          <Row>
            <Radio checked={voice === 'warm'} onChange={() => setVoice('warm')} label="Voice: warm" />
          </Row>
          <Row>
            <Radio checked={voice === 'crisp'} onChange={() => setVoice('crisp')} label="Voice: crisp" />
          </Row>
          <Row>
            <Switch checked={handsFreeWake} onChange={setHandsFreeWake} label="Hands-free wake" />
          </Row>
          <Row>
            <Chip selected={chip === 'describe'} onClick={() => setChip('describe')}>
              describe
            </Chip>
            <Chip selected={chip === 'translate'} onClick={() => setChip('translate')}>
              translate
            </Chip>
            <Chip selected={chip === 'summarize'} onClick={() => setChip('summarize')}>
              summarize
            </Chip>
          </Row>
        </View>
      </Section>

      <Section title="Feedback">
        <View style={{ width: '100%', maxWidth: 460, gap: spacing.sp3 }}>
          <Toast kind="ok">Photo saved to gallery</Toast>
          <Toast kind="info">Hands-free paused — tap to resume</Toast>
          <ErrorLine code="503" retryLabel="RETRY" onRetry={() => {}}>
            agent unreachable. Your message was kept.
          </ErrorLine>
          <StatusBar items={['READY', '14 MSG · 3 IMG', '● ONLINE']} />
        </View>
      </Section>

      <Section title="Chat">
        <View style={{ width: '100%', maxWidth: 640, gap: spacing.sp6 }}>
          <UserMessage time="14:02:11">What&apos;s the fastest way to descale a kettle?</UserMessage>
          <AgentMessage time="14:02:13" actions={<MessageActions />}>
            Fill it halfway with equal parts white vinegar and water, boil, then let it sit for 20 minutes.
          </AgentMessage>
          <AgentMessage streaming>Rinse twice with plain water before</AgentMessage>
          <ThinkingIndicator elapsed="1.4s" />
          <AgentMessage media={<CodeBlock language="shell" code="$ convert IMG_0142.JPG -resize 1080 out.png" />} />
          <Composer value={composerText} onChange={setComposerText} placeholder="message" />
        </View>
      </Section>

      <Section title="Voice">
        <View style={{ width: '100%', maxWidth: 640, gap: spacing.sp4 }}>
          <UserMessage time="14:05:40" media={<VoiceNote duration="0:12" transcript="Is this mushroom safe to eat?" playing={playingUser} onToggle={() => setPlayingUser((v) => !v)} />} />
          <AgentMessage
            media={<VoiceNote from="agent" playing={playingAgent} position="0:06" duration="0:14" progress={0.43} onToggle={() => setPlayingAgent((v) => !v)} />}
          >
            Yes — that&apos;s a chanterelle.
          </AgentMessage>
          <RecordingBar onCancel={() => {}} onSend={() => {}} />
          <HandsFreePanel state="speaking" elapsed="04:12" transcript="The ridges run down the stem, which false chanterelles don't do as clearly." onEnd={() => {}} onMute={() => {}} />
        </View>
      </Section>

      <Section title="Media">
        <ImageFrame filename="IMG_0142.JPG" meta="2.4 MB" caption="Clean this up?" />
        <ImageFrame filename="IMG_0143.JPG" progress={58} onCancel={() => {}} />
        <ImageFrame from="agent" filename="listing_clean.png" meta="1080×810" />
        <AttachmentTray items={attachments} onRemove={(i) => setAttachments((a) => a.filter((_, idx) => idx !== i))} onAdd={() => setAttachments((a) => [...a, { name: `IMG_0${144 + a.length}.JPG` }])} />
      </Section>

      <Section title="Effects">
        {(['subtle', 'standard', 'full'] as const).map((level) => (
          <View key={level} style={{ width: 280, gap: spacing.sp2 }}>
            <CRTScreen level={level} style={{ padding: spacing.sp4, minHeight: 160 }}>
              <AgentMessage>Done. I straightened it and cropped to 4:3.</AgentMessage>
            </CRTScreen>
            <Text style={{ color: colors.textMeta, fontSize: fontSize.meta }}>level=&quot;{level}&quot;</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}
