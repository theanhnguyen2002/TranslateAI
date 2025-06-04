declare module "react-speech-kit" {
  export interface SpeakOptions {
    text: string;
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
    onEnd?: () => void;
  }

  export interface UseSpeechSynthesisResult {
    supported: boolean;
    speak: (options: SpeakOptions) => void;
    cancel: () => void;
    speaking: boolean;
    voices: SpeechSynthesisVoice[];
  }

  export function useSpeechSynthesis(): UseSpeechSynthesisResult;

  export interface UseSpeechRecognitionOptions {
    onResult: (result: string) => void;
    interimResults?: boolean;
    continuous?: boolean;
    lang?: string;
  }

  export interface UseSpeechRecognitionResult {
    supported: boolean;
    listen: (options?: { lang?: string }) => void;
    listening: boolean;
    stop: () => void;
  }

  export function useSpeechRecognition(
    options: UseSpeechRecognitionOptions
  ): UseSpeechRecognitionResult;
}
