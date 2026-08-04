import { NextResponse } from 'next/server'
import { FOLLOWED_TEAMS } from '@/lib/constants'
import { teamService } from '@/lib/team-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const configuredTeam = FOLLOWED_TEAMS.find((team) => team.id === 'martin-arlington')
  const storedTeam = await teamService.getTeamBySlug('martin-arlington')

  if (!configuredTeam) {
    return NextResponse.json(
      { success: false, error: 'James Martin HS is not configured' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    source: storedTeam ? 'vps-database' : 'tracker-configuration',
    team: storedTeam ?? configuredTeam,
    timestamp: new Date().toISOString(),
  })
}
