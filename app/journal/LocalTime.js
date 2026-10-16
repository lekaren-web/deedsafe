'use client';
import { useEffect, useState } from 'react';

// Formats in the viewer's own time zone after hydration, so server and client agree.
export default function LocalTime({ iso }) {
  const [text, setText] = useState(() => new Date(iso).toISOString().slice(0, 16).replace('T', ' ') + ' UTC');
  useEffect(() => {
    setText(new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)));
  }, [iso]);
  return <time dateTime={iso}>{text}</time>;
}
