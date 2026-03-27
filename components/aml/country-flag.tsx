const SIZE = {
  sm: { width: 30, height: 20, fontSize: '6px', cdnHeight: 20 },
  md: { width: 60, height: 40, fontSize: '9px', cdnHeight: 40 },
} as const;

type FlagSize = keyof typeof SIZE;

interface CountryFlagProps {
  countryCode: string;
  authority?: string;
  alt: string;
  size?: FlagSize;
}

export function CountryFlag({ countryCode, authority, alt, size = 'md' }: CountryFlagProps) {
  const isInterpol = authority?.toLowerCase().includes('interpol');
  const countryCodeSrc = countryCode.toLocaleLowerCase();
  const { width, height, fontSize, cdnHeight } = SIZE[size];

  if (isInterpol) {
    return (
      <div
        className="flex items-center justify-center rounded-sm border bg-[#003F87] shrink-0"
        style={{ width, height }}
        title="INTERPOL"
      >
        <span
          className="text-white font-bold tracking-widest leading-none"
          style={{ fontSize }}
        >
          INTERPOL
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-sm border overflow-hidden shrink-0" style={{ width, height }}>
      <picture>
        <source
          type="image/webp"
          srcSet={`https://flagcdn.com/h${cdnHeight}/${countryCodeSrc}.webp, https://flagcdn.com/h${cdnHeight * 2}/${countryCodeSrc}.webp 2x`}
        />
        <source
          type="image/png"
          srcSet={`https://flagcdn.com/h${cdnHeight}/${countryCodeSrc}.png, https://flagcdn.com/h${cdnHeight * 2}/${countryCodeSrc}.png 2x`}
        />
        <img
          src={`https://flagcdn.com/h${cdnHeight}/${countryCodeSrc}.png`}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </picture>
    </div>
  );
}
