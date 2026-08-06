import { NextResponse } from 'next/server'
import { prisma } from '@/lib/team-service'
import { deployedReleaseSha } from '@/lib/release-identity'

export const dynamic = 'force-dynamic'

export async function GET() {
  const releaseSha = deployedReleaseSha()

  try {
    const teamCount = await prisma.team.count()

    return NextResponse.json({
      status: 'ok',
      service: 'tx-hs-football-tracker',
      runtime: 'vps',
      releaseSha,
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
        releaseSha,
        database: 'unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
