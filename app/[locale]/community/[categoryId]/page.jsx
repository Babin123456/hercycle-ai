import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import PostCard from '@/components/community/PostCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, Hash } from 'lucide-react';

export const revalidate = 60;

export default async function CategoryPage({ params }) {
  const { locale, categoryId } = await params;
  const t = await getTranslations('Community');
  const supabase = getSupabaseAdmin();

  // Find category by slug
  const { data: category } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('slug', categoryId)
    .single();

  if (!category) {
    notFound();
  }

  // Fetch posts for this category
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  return (
    <div className="page">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <Link 
        href={`/${locale}/community`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        {t('back_to_community') || 'Back to Community'}
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Hash size={24} className="text-pink-500" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t(`cat_${category.slug}_name`) || category.name}
        </h1>
      </div>
      <p className="text-slate-600 dark:text-slate-400 pl-9">
        {t(`cat_${category.slug}_desc`) || category.description}
      </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          {posts?.length || 0} {t('discussions') || 'Discussions'}
        </h2>
        <Link 
          href={`/${locale}/community/new?category=${category.slug}`}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors text-sm"
        >
          {t('new_post') || 'New Post'}
        </Link>
      </div>

      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">
              {t('no_posts_category') || 'No posts in this category yet. Start the conversation!'}
            </p>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}
