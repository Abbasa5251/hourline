import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { color: string; size?: number; width?: number };

const base = ({ color, size = 22, width = 2 }: P) =>
  ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: width,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }) as const;

export const ClockIcon = (p: P) => (
  <Svg {...base(p)}>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M12 7v5l3 2" />
  </Svg>
);

export const BarsIcon = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M4 6h10M4 12h16M4 18h7" />
  </Svg>
);

export const SwapIcon = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M7 4L3 8l4 4M3 8h14M17 12l4 4-4 4M21 16H7" />
  </Svg>
);

export const SlidersIcon = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <Circle cx={16} cy={7} r={2} />
    <Circle cx={8} cy={17} r={2} />
  </Svg>
);

export const PlusIcon = (p: P) => (
  <Svg {...base({ width: 3, ...p })}>
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

export const CloseIcon = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const SearchIcon = (p: P) => (
  <Svg {...base(p)}>
    <Circle cx={11} cy={11} r={7} />
    <Path d="M20 20l-4-4" />
  </Svg>
);

export const CheckIcon = (p: P) => (
  <Svg {...base({ width: 3, ...p })}>
    <Path d="M5 12l5 5 9-10" />
  </Svg>
);

export const CalendarIcon = (p: P) => (
  <Svg {...base(p)}>
    <Rect x={3} y={5} width={18} height={16} rx={3} />
    <Path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

export const ChevronDownIcon = (p: P) => (
  <Svg {...base({ width: 2.5, ...p })}>
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

export const SwapVerticalIcon = (p: P) => (
  <Svg {...base({ width: 2.5, ...p })}>
    <Path d="M8 4v16M4 16l4 4 4-4M16 20V4M12 8l4-4 4 4" />
  </Svg>
);

export const AlarmIcon = (p: P) => (
  <Svg {...base(p)}>
    <Circle cx={12} cy={13} r={8} />
    <Path d="M12 9v4l2 2M5 3L2 6M19 3l3 3" />
  </Svg>
);

export const ChevronUpIcon = (p: P) => (
  <Svg {...base({ width: 2.5, ...p })}>
    <Path d="M6 15l6-6 6 6" />
  </Svg>
);
