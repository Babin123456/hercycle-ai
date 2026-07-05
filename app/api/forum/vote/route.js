import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { itemType, itemId, voteValue } = body;

    if (!itemType || !itemId || !voteValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['post', 'comment'].includes(itemType)) {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    if (![1, -1].includes(voteValue)) {
      return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
    }

    // Hash the user ID so we don't store raw clerk IDs directly, but we can uniquely identify them
    const hashedUserId = crypto.createHash('sha256').update(userId).digest('hex');

    const supabase = getSupabaseAdmin();
    
    // 1. Check if user already voted
    const { data: existingVote, error: fetchError } = await supabase
      .from('forum_votes')
      .select('id, vote_value')
      .eq('user_id', hashedUserId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch Vote Error:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const tableName = itemType === 'post' ? 'forum_posts' : 'forum_comments';

    if (existingVote) {
      // User has already voted
      if (existingVote.vote_value === voteValue) {
         // Same vote, maybe toggle it off (remove vote)
         await supabase.from('forum_votes').delete().eq('id', existingVote.id);
         
         // Decrement/Increment back
         const { error: updateError } = await supabase.rpc('decrement_vote', {
            table_name: tableName,
            row_id: itemId,
            amount: voteValue
         });
         
         if (updateError) {
             // Fallback if RPC doesn't exist, though typically we'd create an RPC or do a two-step.
             // For simplicity if RPC isn't provided, we can fetch and update.
             const { data: item } = await supabase.from(tableName).select('upvotes').eq('id', itemId).single();
             if (item) {
                 await supabase.from(tableName).update({ upvotes: item.upvotes - voteValue }).eq('id', itemId);
             }
         }
         return NextResponse.json({ message: 'Vote removed', currentVote: 0 }, { status: 200 });
      } else {
         // Changing vote
         await supabase.from('forum_votes').update({ vote_value: voteValue }).eq('id', existingVote.id);
         
         // If changed from 1 to -1, net change is -2. If -1 to 1, net change is 2.
         const netChange = voteValue * 2;
         const { data: item } = await supabase.from(tableName).select('upvotes').eq('id', itemId).single();
         if (item) {
             await supabase.from(tableName).update({ upvotes: item.upvotes + netChange }).eq('id', itemId);
         }
         return NextResponse.json({ message: 'Vote changed', currentVote: voteValue }, { status: 200 });
      }
    } else {
      // New vote
      const { error: insertError } = await supabase
        .from('forum_votes')
        .insert([{ user_id: hashedUserId, item_type: itemType, item_id: itemId, vote_value: voteValue }]);
        
      if (insertError) {
          console.error('Insert Vote Error:', insertError);
          return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
      }

      const { data: item } = await supabase.from(tableName).select('upvotes').eq('id', itemId).single();
      if (item) {
          await supabase.from(tableName).update({ upvotes: item.upvotes + voteValue }).eq('id', itemId);
      }
      return NextResponse.json({ message: 'Vote added', currentVote: voteValue }, { status: 201 });
    }
  } catch (error) {
    console.error('Vote Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
