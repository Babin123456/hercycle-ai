import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import PostCard from '@/components/community/PostCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Users, Hash } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

export default async function CommunityPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations('Community');
  const supabase = getSupabaseAdmin();

  // Fetch categories and recent posts
  const [{ data: categories }, { data: posts }] = await Promise.all([
    supabase.from('forum_categories').select('*').order('name'),
    supabase.from('forum_posts').select('*').order('created_at', { ascending: false }).limit(20)
  ]);

  return (
    <div className="page">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t('title') || 'Anonymous Community'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('subtitle') || 'A safe, anonymous space to discuss PCOD, cycle tracking, and mental health.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t('recent_discussions') || 'Recent Discussions'}
            </h2>
            <Link 
              href={`/${locale}/community/new`}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
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
                <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                  {t('no_posts_yet') || 'No posts yet'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {t('be_the_first') || 'Be the first to start a discussion!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Hash size={18} className="text-pink-500" />
              {t('categories') || 'Categories'}
            </h3>
            <div className="space-y-2">
              {categories?.map(category => (
                <Link
                  key={category.id}
                  href={`/${locale}/community/${category.slug}`}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {t(`cat_${category.slug}_name`) || category.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {t(`cat_${category.slug}_desc`) || category.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              {t('safe_space') || 'A Safe Space'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('safe_space_desc') || 'Your identity is protected. All posts and comments are strictly moderated by AI to ensure a supportive environment for everyone.'}
            </p>
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
