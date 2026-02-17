import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const team = await prisma.team.upsert({
        where: { maxprepsUrl: 'https://www.maxpreps.com/tx/arlington/martin-warriors/football/' },
        update: {},
        create: {
            name: 'Martin',
            school: 'Arlington Martin HS',
            city: 'Arlington',
            classification: '6A',
            district: '8-6A',
            maxprepsUrl: 'https://www.maxpreps.com/tx/arlington/martin-warriors/football/',
        },
    });

    console.log('✅ Created/Updated team:', team.name);

    const count = await prisma.team.count();
    console.log(`📊 Total teams in DB: ${count}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
