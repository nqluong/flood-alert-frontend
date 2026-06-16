export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Vừa xong';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    // Format as date if older than 7 days
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

export function formatNotificationLocation(data: any): string {
  if (!data) {
    return '';
  }

  if (typeof data.location === 'string' && data.location.trim().length > 0) {
    return data.location;
  }

  const lat = typeof data.lat === 'string' ? parseFloat(data.lat) : data.lat;
  const lon = typeof data.lon === 'string' ? parseFloat(data.lon) : data.lon;
  if (typeof lat === 'number' && !Number.isNaN(lat) &&
      typeof lon === 'number' && !Number.isNaN(lon)) {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }

  return '';
}
