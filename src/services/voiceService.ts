/**
 * Service for voice-to-text conversion and audio handling
 */

export interface SpeechRecognitionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class VoiceReportService {
  private recognition: any;
  private isListening: boolean = false;
  private transcript: string = '';
  private isFinal: boolean = false;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition API not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.language = 'en-US';

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  public startListening(
    onResult: (result: SpeechRecognitionResult) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.transcript = '';
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        this.transcript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          this.transcript += transcriptSegment;
        }

        this.isFinal = event.results[event.results.length - 1].isFinal;

        const confidence = event.results[event.results.length - 1][0].confidence;

        onResult({
          text: this.transcript,
          isFinal: this.isFinal,
          confidence,
        });
      };

      this.recognition.start();
      resolve();
    });
  }

  public stopListening(): string {
    this.recognition.stop();
    this.isListening = false;
    return this.transcript;
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public abort(): void {
    this.recognition.abort();
    this.isListening = false;
  }
}
