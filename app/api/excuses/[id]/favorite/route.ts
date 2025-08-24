import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { is_favorite } = await request.json();
    
    // Получаем пользователя
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Обновляем статус избранного
    const { error } = await supabase
      .from('excuses')
      .update({ is_favorite })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating favorite:', error);
      return NextResponse.json(
        { error: 'Failed to update favorite status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, is_favorite });

  } catch (error) {
    console.error('Favorite API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
