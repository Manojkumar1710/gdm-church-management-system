import { useEffect, useMemo, useRef, useState } from 'react';

const STYLE_ID = 'animated-text-styles';

const ANIMATED_TEXT_STYLES = `
.animated-text { display: block; }
.animated-text--inline { display: inline; }
.animated-text__word { display: inline-block; white-space: nowrap; }
.animated-text__char {
  display: inline-block;
  opacity: 0;
  transform: translateY(12px);
  white-space: pre;
  will-change: opacity, transform;
}
.animated-text.is-visible .animated-text__char {
  animation: animatedTextLetterReveal 450ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes animatedTextLetterReveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .animated-text__char {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

function splitGraphemes(value, lang) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter(lang === 'te' ? 'te' : undefined, { granularity: 'grapheme' });
      return Array.from(segmenter.segment(value), part => part.segment);
    } catch {
      return Array.from(value);
    }
  }
  return Array.from(value);
}

export function useInViewOnce(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold });

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return [ref, inView];
}

export default function AnimatedText({
  text,
  lang,
  className = '',
  inline = false,
  baseDelay = 0,
  stagger = 0.055,
  as: Tag = 'span',
}) {
  const value = String(text ?? '');
  const [ref, inView] = useInViewOnce(0.2);

  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = ANIMATED_TEXT_STYLES;
    document.head.appendChild(style);
  }, []);

  const tokens = useMemo(() => {
    const parts = value.match(/\S+|\s+/g) || [];
    return parts.map(part => ({
      text: part,
      isSpace: /^\s+$/.test(part),
      chars: /^\s+$/.test(part) ? [] : splitGraphemes(part, lang),
    }));
  }, [value, lang]);

  let charIndex = 0;
  const content = [];

  tokens.forEach((token, tokenIndex) => {
    if (token.isSpace) {
      charIndex += Array.from(token.text).length;
      content.push(' ');
      return;
    }

    const chars = token.chars.map((char, index) => {
      const delay = baseDelay + charIndex * stagger;
      charIndex += 1;
      return (
        <span
          aria-hidden="true"
          key={`char-${charIndex}-${char}`}
          className="animated-text__char home-letter"
          style={{ animationDelay: `${delay.toFixed(3)}s` }}
        >
          {char}
        </span>
      );
    });

    content.push(
      <span aria-hidden="true" className="animated-text__word" key={`word-${tokenIndex}`}>
        {chars}
      </span>
    );
  });

  return (
    <Tag
      ref={ref}
      className={[
        'animated-text',
        inline ? 'animated-text--inline' : '',
        'home-letter-reveal',
        inline ? 'home-letter-reveal--inline' : '',
        inView ? 'is-visible' : '',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={value}
    >
      <span className="sr-only">{value}</span>
      {content}
    </Tag>
  );
}
