// Terminus design system — barrel export.
// 29 components across 7 groups, converted 1:1 from the reference handoff
// (React web + CSS custom properties) into React Native / Expo primitives.

export * from './tokens';

// core
export * from './components/core/PixelIcon';
export * from './components/core/Button';
export * from './components/core/IconButton';
export * from './components/core/Cursor';
export * from './components/core/Spinner';
export * from './components/core/ProgressBar';
export * from './components/core/Keycap';

// forms
export * from './components/forms/TextInput';
export * from './components/forms/Checkbox';
export * from './components/forms/Radio';
export * from './components/forms/Switch';
export * from './components/forms/Chip';

// feedback
export * from './components/feedback/Toast';
export * from './components/feedback/ErrorLine';
export * from './components/feedback/StatusBar';

// chat
export * from './components/chat/UserMessage';
export * from './components/chat/AgentMessage';
export * from './components/chat/SystemLine';
export * from './components/chat/ThinkingIndicator';
export * from './components/chat/MessageActions';
export * from './components/chat/CodeBlock';
export * from './components/chat/Composer';

// voice
export * from './components/voice/Waveform';
export * from './components/voice/VoiceNote';
export * from './components/voice/RecordingBar';
export * from './components/voice/HandsFreePanel';

// media
export * from './components/media/ImageFrame';
export * from './components/media/AttachmentTray';
export * from './components/media/PhotoViewer';

// session (list + chat shell — new for the full app screens)
export * from './components/session/SessionRow';
export * from './components/session/EmptyState';
export * from './components/session/ActionSheet';
export * from './components/session/DeleteConfirmSheet';
export * from './components/session/ContextMenu';
export * from './components/session/DropOverlay';

// effects
export * from './components/effects/CRTScreen';

// theming
export { useCRT } from './internal/CRTContext';
export { useReducedMotion } from './internal/useReducedMotion';
