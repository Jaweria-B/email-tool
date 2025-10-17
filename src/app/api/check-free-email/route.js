// app/api/check-free-email/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { anonymousDevicesDb } from '@/lib/database';

export async function GET(request) {
  try {
    const cookieStore = request.cookies;
    const deviceId = cookieStore.get('device_id')?.value;

    if (!deviceId) {
      // If there's no device ID, they haven't generated an email yet
      return NextResponse.json({ hasFreeEmail: true });
    }

    const existingDevice = await anonymousDevicesDb.findByDeviceId(deviceId);
    if (existingDevice) {
      // If the device ID is in the database, they've used their free email
      return NextResponse.json({ hasFreeEmail: false });
    }

    // If the device ID cookie exists but is not in the database, they can still generate a free email
    return NextResponse.json({ hasFreeEmail: true });
  } catch (error) {
    console.error('Error checking free email status:', error);
    return NextResponse.json(
      { error: 'Failed to check free email status' },
      { status: 500 }
    );
  }
}