import Svg, { G, Line, Path } from 'react-native-svg';

import { palette } from '@/theme';

/** The app mark (same geometry as the icon in scripts/export-icons.mjs). */
export function Mark({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <G stroke={color} strokeWidth={4.5} strokeLinecap="round">
        {[-45, -22.5, 22.5, 45].map((a) => (
          <Line key={a} x1={50} y1={44} x2={50} y2={37} transform={`rotate(${a} 50 82)`} />
        ))}
      </G>
      <Line x1={50} y1={44} x2={50} y2={30} stroke={palette.apricot} strokeWidth={5} strokeLinecap="round" />
      <Path d="M18.2 70 A34 34 0 0 1 81.8 70 Z" fill={color} />
    </Svg>
  );
}
