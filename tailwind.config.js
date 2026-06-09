module.exports = {
  content: [
    "./*.html",
    "./p/**/*.html",
    "./blog/**/*.html",
    "./content/**/*.html",
    "./admin-secure/**/*.html",
    "./*.js",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1B2A41',
        gold: '#C9A35E',
        'navy-dark': '#0F1B2D',
        'gold-light': '#D9B570'
      },
      fontFamily: {
        arabic: ['Alexandria', 'Tajawal', 'sans-serif']
      }
    }
  },
  safelist: [
    // Dynamic classes used in JS that the scanner might miss
    'bg-green-500','bg-green-600','bg-red-500','bg-red-600','bg-yellow-500',
    'text-green-600','text-red-600','text-yellow-600','text-blue-600',
    'border-green-500','border-red-500','border-gold','border-navy',
    'hover:bg-gold','hover:bg-navy','hover:text-gold','hover:text-navy',
    'animate-pulse','animate-spin','animate-bounce','opacity-0','opacity-100',
    'translate-y-0','translate-y-full','scale-95','scale-100',
    {pattern: /^(bg|text|border)-(navy|gold|white|gray|red|green|yellow|blue|indigo|purple|emerald|amber)-(50|100|200|300|400|500|600|700|800|900)$/},
    {pattern: /^(p|m|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)-([0-9]|1[0-6]|20|24|32|40|48|56|64)$/},
    {pattern: /^(text)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/},
    {pattern: /^(w|h|min-w|min-h|max-w|max-h)-(full|screen|auto|fit|min|max|0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64|72|80|96)$/},
    {pattern: /^(rounded)(-[a-z0-9]+)?$/},
    {pattern: /^(grid-cols|gap|space-x|space-y)-([0-9]+)$/}
  ]
}
