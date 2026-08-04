import { NextResponse } from 'next/server'
import { prisma } from '@/lib/team-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const teamCount = await prisma.team.count()

    return NextResponse.json({
      status: 'ok',
      service: 'tx-hs-football-tracker',
      runtime: 'vps',
      database: 'connected',
      teamCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Texas tracker health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        service: 'tx-hs-football-tracker',
        runtime: 'vps',
        database: 'unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
