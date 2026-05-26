'use client';

import { useEffect } from 'react';

interface HtmlAttributesProps {
  lang: string;
  dir: 'rtl' | 'ltr';
}

// Updates the root <html> element's lang and dir attributes on the client.
// This is needed because the root layout sets default Arabic/RTL attributes,
// and nested locale segments need to override them for the English locale.
export default function HtmlAttributes({ lang, dir }: HtmlAttributesProps) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return null;
}
