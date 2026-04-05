interface CountryFlagProps {
  countryCode: string;
  alt: string;
}

export function CountryFlag({ countryCode, alt }: CountryFlagProps) {
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`https://flagcdn.com/h20/${countryCode}.webp,
                          https://flagcdn.com/h40/${countryCode}.webp 2x,
                          https://flagcdn.com/h60/${countryCode}.webp 3x`}
      />
      <source
        type="image/png"
        srcSet={`https://flagcdn.com/h20/${countryCode}.png,
                          https://flagcdn.com/h40/${countryCode}.png 2x,
                          https://flagcdn.com/h60/${countryCode}.png 3x`}
      />
      <img
        src={`https://flagcdn.com/h40/${countryCode}.png`}
        className="rounded-sm bg-black border"
        height="20"
        alt={alt}
      />
    </picture>
  );
}
