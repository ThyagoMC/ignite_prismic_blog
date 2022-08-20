import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const postFormatter = post => ({
  uid: post.uid,
  first_publication_date: post.first_publication_date,
  data: {
    title: post.data.title,
    subtitle: post.data.subtitle,
    author: post.data.author,
  },
});

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps) {
  const [posts, setPosts] = useState(results);
  const [nextPageUrl, setNextPageUrl] = useState(next_page);
  const [loading, setLoading] = useState('');

  async function getNextPage() {
    setLoading('Carregando...');
    const postsResponse = await fetch(nextPageUrl);
    const jsonResponse = await postsResponse.json();

    const newPosts = jsonResponse.results?.map(postFormatter);

    setPosts(data => [...data, ...newPosts]);
    setNextPageUrl(jsonResponse.next_page);
    setLoading('');
  }

  function formatDate(date: string): string {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
  }

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={`${commonStyles.content} ${styles.blockContent}`}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`}>
              <a key={post.uid}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <div>
                    <FiCalendar />
                    <time>{formatDate(post.first_publication_date)}</time>
                  </div>
                  <div>
                    <FiUser /> <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPageUrl && (
          <div className={styles.blockLoad}>
            <button
              type="button"
              className={styles.loadMore}
              onClick={getNextPage}
              disabled={!!loading}
            >
              {loading || 'Carregar mais posts'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 2 });
  const results = postsResponse.results?.map(postFormatter);

  return {
    props: { postsPagination: { results, next_page: postsResponse.next_page } },
  };
};
