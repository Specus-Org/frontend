import { NextResponse, type NextRequest } from 'next/server';
import { decodeJwtPayload } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const idToken = request.cookies.get('specus_id_token')?.value;

    if (!idToken) {
      return NextResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const payload = decodeJwtPayload(idToken);

    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid token', code: 'TOKEN_INVALID' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        sub: payload.sub ?? '',
        name: payload.name ?? '',
        email: payload.email ?? '',
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Failed to read user info', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
