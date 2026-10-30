import { ImageResponse } from 'next/og';
import OgFrame from '@/features/og/components/OgFrame';
import { colors, fonts, size } from '@/features/og/theme';
import { profile } from '@/features/profile/data/profile';

export const alt = `${profile.name}, ${profile.role}: ${profile.headline}`;
export { contentType, size } from '@/features/og/theme';

// Site-wide card: used by every route without its own opengraph-image.
// Rendered once at build time, like a static file.
export default function Image() {
  return new ImageResponse(
    <OgFrame caption="loladolinsky.com">
      {/* The header's boxed wordmark: two rules run through the box, and the
          name's background masks them where the text sits */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          alignSelf: 'flex-start',
          marginLeft: 36,
          border: `5px solid ${colors.fg}`,
          padding: '16px 36px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -41,
            right: -41,
            top: 12,
            height: 5,
            background: colors.fg,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -41,
            right: -41,
            bottom: 12,
            height: 5,
            background: colors.fg,
          }}
        />
        <div
          style={{
            display: 'flex',
            background: colors.bg,
            padding: '0 20px',
            fontFamily: 'Jost',
            fontWeight: 600,
            fontSize: 56,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {profile.name}
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          fontFamily: 'Geist Mono',
          fontSize: 28,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: colors.accent,
        }}
      >
        {profile.role}
      </div>
      <div style={{ marginTop: 20, maxWidth: 900, fontSize: 40, lineHeight: 1.3 }}>
        {profile.headline}
      </div>
    </OgFrame>,
    { ...size, fonts }
  );
}
