import { useCallback, useEffect, useRef, useState } from 'react';

type ScannerState = 'idle' | 'starting' | 'scanning' | 'denied' | 'unsupported' | 'error';

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorCtor {
  new (options: { formats: string[] }): BarcodeDetectorLike;
}

function nativeDetector(): BarcodeDetectorLike | null {
  const ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  return ctor ? new ctor({ formats: ['qr_code'] }) : null;
}

/** iOS Safari chưa có BarcodeDetector → chỉ khi đó mới tải zxing-wasm (05_FRONTEND §6.9) */
async function wasmDetector(): Promise<BarcodeDetectorLike> {
  const { readBarcodesFromImageData } = await import('zxing-wasm/reader');
  return {
    async detect(source) {
      const video = source as HTMLVideoElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context || !canvas.width || !canvas.height) return [];
      context.drawImage(video, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const results = await readBarcodesFromImageData(imageData, { formats: ['QRCode'] });
      return results.map((result) => ({ rawValue: result.text }));
    },
  };
}

export function useQrScanner(onResult: (text: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<ScannerState>('idle');
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const start = useCallback(async () => {
    setState('starting');
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      const video = videoRef.current;
      if (!video) return () => undefined;
      video.srcObject = stream;
      await video.play();

      const detector = nativeDetector() ?? (await wasmDetector());
      setState('scanning');

      const tick = async () => {
        if (stopped) return;
        try {
          const results = await detector.detect(video);
          if (results.length > 0 && results[0].rawValue) {
            onResultRef.current(results[0].rawValue);
            return;
          }
        } catch {
          // Khung hình lỗi thì bỏ qua, vòng sau quét lại
        }
        raf = requestAnimationFrame(() => void tick());
      };
      void tick();
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      setState(name === 'NotAllowedError' ? 'denied' : name === 'NotFoundError' ? 'unsupported' : 'error');
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void start().then((fn) => {
      cleanup = fn;
    });
    return () => cleanup?.();
  }, [start]);

  return { videoRef, state };
}
