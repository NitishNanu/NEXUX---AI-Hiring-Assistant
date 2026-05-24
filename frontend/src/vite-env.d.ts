/// <reference types="vite/client" />

declare module 'vanilla-tilt';
declare module 'splitting';

interface Window {
  confetti?: typeof import('canvas-confetti').default;
}
