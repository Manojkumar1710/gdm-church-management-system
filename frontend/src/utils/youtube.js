/**
 * Extract the YouTube video ID from any valid YouTube URL.
 * Handles: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID
 */
export function getYoutubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0];
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2];
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2];
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

/**
 * Return the best available thumbnail URL for a YouTube video.
 * Falls back through: mqdefault → hqdefault → sddefault
 */
export function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

/**
 * Return the embed URL for a YouTube video.
 */
export function getYoutubeEmbed(url) {
  const id = getYoutubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0`;
}
