export const PartsIllustration = () => (
  <svg aria-hidden='true' fill='none' viewBox='0 0 550 350'>
    <defs>
      <linearGradient
        id='box-front'
        x1='199'
        y1='142'
        x2='321'
        y2='282'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#e6dfd3' />
        <stop offset='1' stopColor='#cfc3b1' />
      </linearGradient>
      <linearGradient
        id='box-side'
        x1='333'
        y1='156'
        x2='410'
        y2='246'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#c3b49c' />
        <stop offset='1' stopColor='#dfd6c7' />
      </linearGradient>
      <linearGradient
        id='filter-body'
        x1='304'
        y1='112'
        x2='431'
        y2='132'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#282d31' />
        <stop offset='.28' stopColor='#50595d' />
        <stop offset='.5' stopColor='#343d40' />
        <stop offset='.82' stopColor='#181d20' />
        <stop offset='1' stopColor='#31383b' />
      </linearGradient>
      <linearGradient
        id='metal'
        x1='118'
        y1='156'
        x2='310'
        y2='285'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#e2e5e5' />
        <stop offset='.3' stopColor='#9ba2a6' />
        <stop offset='.57' stopColor='#e4e6e7' />
        <stop offset='.8' stopColor='#a9b0b4' />
        <stop offset='1' stopColor='#c8cdcf' />
      </linearGradient>
      <radialGradient id='disc-face'>
        <stop offset='.2' stopColor='#9da5aa' />
        <stop offset='.38' stopColor='#c7cdd0' />
        <stop offset='.41' stopColor='#707b81' />
        <stop offset='.49' stopColor='#bcc4c7' />
        <stop offset='.52' stopColor='#d8dcde' />
        <stop offset='1' stopColor='#b4bdc3' />
      </radialGradient>
      <radialGradient id='shadow'>
        <stop stopColor='#746d60' stopOpacity='.25' />
        <stop offset='1' stopColor='#746d60' stopOpacity='0' />
      </radialGradient>
      <filter id='soft'>
        <feGaussianBlur stdDeviation='5' />
      </filter>
    </defs>
    <ellipse cx='299' cy='295' rx='200' ry='27' fill='url(#shadow)' />
    <path d='M228 138 331 105 426 156 324 194Z' fill='#eee8de' />
    <path d='M228 138 324 190 324 292 228 240Z' fill='url(#box-front)' />
    <path d='M324 190 426 156 426 258 324 292Z' fill='url(#box-side)' />
    <path d='M239 143 324 187 416 157' stroke='#faf6ee' strokeOpacity='.7' />
    <path
      d='M274 123 371 175 371 209 350 216 350 182 253 130Z'
      fill='#d8cbb8'
    />
    <path d='M247 174 292 197 292 217 247 194Z' fill='#df3028' />
    <path d='M251 180 277 193M251 184 269 193' stroke='white' strokeWidth='2' />
    <path d='M338 243 380 229 380 256 338 270Z' fill='#eeebe4' />
    <path
      d='M344 246 344 262M348 245 348 261M353 243 353 259M356 242 356 258M361 241 361 256M364 240 364 255M370 238 370 253M374 237 374 251'
      stroke='#66635c'
      strokeWidth='1.5'
    />
    <g transform='rotate(13 374 140)'>
      <path
        d='M318 80C318 63 432 63 432 80V182C432 208 318 208 318 182Z'
        fill='url(#filter-body)'
      />
      <ellipse cx='375' cy='80' rx='57' ry='15' fill='#171e22' />
      <ellipse cx='375' cy='78' rx='52' ry='11' fill='#525c61' />
      <ellipse cx='375' cy='78' rx='45' ry='8' fill='#b9bec0' />
      <ellipse cx='375' cy='78' rx='18' ry='5' fill='#222b30' />
      <path
        d='M326 85V176'
        stroke='#798285'
        strokeOpacity='.5'
        strokeWidth='3'
      />
      <path
        d='M320 172C339 187 410 191 430 174'
        stroke='#60686b'
        strokeOpacity='.5'
      />
      <path d='M338 113Q375 122 412 113V153Q375 162 338 153Z' fill='#e5e6e1' />
      <path d='M338 113Q375 122 412 113V126Q375 135 338 126Z' fill='#e72d26' />
      <path
        d='M347 138Q375 144 403 138M347 145Q365 149 383 147'
        stroke='#858b89'
        strokeWidth='2'
      />
      <path d='M347 121Q365 124 383 123' stroke='#fff' strokeWidth='2' />
    </g>
    <g transform='rotate(-23 209 222)'>
      <ellipse cx='209' cy='230' rx='98' ry='68' fill='#6e797e' />
      <path
        d='M111 219V232M119 244V230M133 255V240M149 265V251M169 273V257M190 279V264M211 280V264M232 278V262M253 273V257M272 264V249M287 253V238M301 237V223'
        stroke='#48555d'
        strokeWidth='3'
      />
      <ellipse cx='209' cy='219' rx='98' ry='68' fill='url(#metal)' />
      <ellipse
        cx='209'
        cy='217'
        rx='92'
        ry='63'
        fill='url(#disc-face)'
        stroke='#dfe4e7'
      />
      <ellipse
        cx='209'
        cy='217'
        rx='84'
        ry='57'
        stroke='#e3e7e8'
        strokeOpacity='.4'
      />
      <ellipse
        cx='209'
        cy='217'
        rx='76'
        ry='51'
        stroke='#5d6c73'
        strokeOpacity='.2'
      />
      <ellipse
        cx='209'
        cy='217'
        rx='65'
        ry='44'
        stroke='#e6e9ea'
        strokeOpacity='.5'
      />
      <ellipse cx='209' cy='208' rx='40' ry='30' fill='#7c898f' />
      <path d='M169 207V218C169 254 249 254 249 218V207' fill='#8e9bA2' />
      <ellipse
        cx='209'
        cy='205'
        rx='40'
        ry='29'
        fill='#bfc8cc'
        stroke='#dbe0e2'
      />
      <ellipse cx='209' cy='205' rx='17' ry='12' fill='#4f5e66' />
      <ellipse cx='209' cy='208' rx='13' ry='8' fill='#303e47' />
      <ellipse cx='209' cy='185' rx='5' ry='3.6' fill='#5a6870' />
      <ellipse cx='234' cy='199' rx='5' ry='3.6' fill='#5a6870' />
      <ellipse cx='224' cy='222' rx='5' ry='3.6' fill='#5a6870' />
      <ellipse cx='194' cy='222' rx='5' ry='3.6' fill='#5a6870' />
      <ellipse cx='184' cy='199' rx='5' ry='3.6' fill='#5a6870' />
    </g>
    <path d='M135 112H160M147 100V124' stroke='#c8c2b8' strokeWidth='1.5' />
    <circle cx='457' cy='217' r='4' stroke='#c8c2b8' strokeWidth='1.5' />
    <circle cx='269' cy='65' r='3' fill='#ded7cd' />
  </svg>
);
