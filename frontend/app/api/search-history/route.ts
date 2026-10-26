import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { getDatabaseFailure } from '@/lib/database-errors';

export const dynamic = 'force-dynamic';

// Initialize Prisma
const pgAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});
const prisma = new PrismaClient({ adapter: pgAdapter });

// ==========================================
// GET: Fetch recent searches
// ==========================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searches = await prisma.search_history.findMany({
      where: { user_id: userId },
      orderBy: { searched_at: 'desc' },
      take: 10,
      select: {
        id: true,
        search_query: true,
        searched_at: true,
      },
    });

    return NextResponse.json(searches);
  } catch (error) {
    console.error("❌ Error fetching search history:", error);
    const failure = getDatabaseFailure(error, "Failed to fetch search history");
    return NextResponse.json(
      { error: failure.message },
      { status: failure.status }
    );
  }
}

// ==========================================
// POST: Add a new search query
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query is required and must be at least 2 characters" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if the search already exists
    const existingSearch = await prisma.search_history.findFirst({
      where: {
        search_query: query.trim(),
        user_id: userId,
      },
    });

    if (existingSearch) {
      const updated = await prisma.search_history.update({
        where: { id: existingSearch.id },
        data: { searched_at: new Date() },
      });
      return NextResponse.json({ success: true, search: updated });
    }

    const newSearch = await prisma.search_history.create({
      data: {
        search_query: query.trim(),
        user_id: userId,
        searched_at: new Date(),
      },
    });

    // Keep only 10 most recent searches
    const allSearches = await prisma.search_history.findMany({
      where: { user_id: userId },
      orderBy: { searched_at: 'desc' },
      skip: 10,
    });

    if (allSearches.length > 0) {
      const idsToDelete = allSearches.map(s => s.id);
      await prisma.search_history.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
    }

    return NextResponse.json({ success: true, search: newSearch }, { status: 201 });
  } catch (error) {
    console.error("❌ Error adding search:", error);
    const failure = getDatabaseFailure(error, "Failed to add search");
    return NextResponse.json(
      { error: failure.message },
      { status: failure.status }
    );
  }
}

// ==========================================
// DELETE: Clear all recent searches
// ==========================================
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.search_history.deleteMany({
      where: { user_id: userId },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Search history cleared" 
    });
  } catch (error) {
    console.error("❌ Error clearing search history:", error);
    const failure = getDatabaseFailure(error, "Failed to clear search history");
    return NextResponse.json(
      { error: failure.message },
      { status: failure.status }
    );
  }
}
