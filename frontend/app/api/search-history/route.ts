import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

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
    const session = await getServerSession();
    // @ts-ignore - session.user.id exists but type doesn't know it
    const userId = session?.user?.id || null;

    const searches = await prisma.search_history.findMany({
      where: userId ? { user_id: userId } : {},
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
    return NextResponse.json(
      { error: "Failed to fetch search history" },
      { status: 500 }
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

    const session = await getServerSession();
    // @ts-ignore - session.user.id exists but type doesn't know it
    const userId = session?.user?.id || null;

    // Check if the search already exists
    const existingSearch = await prisma.search_history.findFirst({
      where: {
        search_query: query.trim(),
        ...(userId ? { user_id: userId } : {}),
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
      where: userId ? { user_id: userId } : {},
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
    return NextResponse.json(
      { error: "Failed to add search" },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE: Clear all recent searches
// ==========================================
export async function DELETE() {
  try {
    const session = await getServerSession();
    // @ts-ignore - session.user.id exists but type doesn't know it
    const userId = session?.user?.id || null;

    await prisma.search_history.deleteMany({
      where: userId ? { user_id: userId } : {},
    });

    return NextResponse.json({ 
      success: true, 
      message: "Search history cleared" 
    });
  } catch (error) {
    console.error("❌ Error clearing search history:", error);
    return NextResponse.json(
      { error: "Failed to clear search history" },
      { status: 500 }
    );
  }
}