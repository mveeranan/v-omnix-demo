/** True when the URL can be used as an <img src> (not a video blob/data URL). */
export function isGalleryImageThumbnail(thumbnailUrl: string | undefined, mediaUrl: string): boolean {
  if (!thumbnailUrl?.trim()) return false;
  if (thumbnailUrl === mediaUrl) return false;
  if (thumbnailUrl.startsWith('data:video/')) return false;
  return thumbnailUrl.startsWith('data:image/') || thumbnailUrl.startsWith('blob:') || thumbnailUrl.startsWith('http');
}

/** Capture a JPEG data URL from the first frame of a video file or data URL. */
export function captureVideoThumbnail(source: File | string, seekSeconds = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Not in browser'));
      return;
    }

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    let objectUrl: string | null = null;

    const cleanup = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };

    const fail = (err: Error) => {
      cleanup();
      reject(err);
    };

    if (source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      video.src = objectUrl;
    } else {
      video.src = source;
    }

    video.addEventListener('error', () => fail(new Error('Failed to load video for thumbnail')));

    video.addEventListener('loadeddata', () => {
      const target = Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(seekSeconds, video.duration * 0.1)
        : seekSeconds;
      video.currentTime = target;
    });

    video.addEventListener('seeked', () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) {
          fail(new Error('Video has no dimensions'));
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          fail(new Error('Canvas unavailable'));
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
        cleanup();
      } catch (e) {
        fail(e instanceof Error ? e : new Error('Thumbnail capture failed'));
      }
    });
  });
}
