import type { ReactNode } from 'react';
import { colors, stripe } from '../theme';

// The site's double-rule poster frame, with the umbrella stripe and a caption
// along the bottom. Satori only lays out flexbox, so every element with more
// than one child sets display: flex.
export default function OgFrame({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: 40,
        background: colors.bg,
        color: colors.fg,
        fontFamily: 'Jost',
      }}
    >
      <div style={{ display: 'flex', flex: 1, border: `6px solid ${colors.fg}`, padding: 10 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            border: `2px solid ${colors.fg}`,
            padding: '56px 72px 48px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{children}</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              {stripe.map((color) => (
                <div key={color} style={{ width: 48, height: 12, background: color }} />
              ))}
            </div>
            <div
              style={{
                fontFamily: 'Geist Mono',
                fontSize: 22,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: colors.muted,
              }}
            >
              {caption}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
