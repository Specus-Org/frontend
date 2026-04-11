import { NextResponse, type NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/api';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const url = `${getApiBaseUrl()}/api/v1/cms/uploads${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(data ?? { message: 'Failed to fetch uploads' }, {
        status: response.status,
      });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Failed to fetch uploads' }, { status: 502 });
  }
}
