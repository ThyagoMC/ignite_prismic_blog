import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import commonStyles from '../../styles/common.module.scss';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  function formatDate(date: string): string {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
  }
  return !post ? (
    <span>Carregando...</span>
  ) : (
    <div>
      {post?.data.banner.url && (
        <img
          style={{ width: '100%', height: '400px' }}
          src={post.data.banner.url}
          alt="banner"
        />
      )}

      <main className={commonStyles.container}>
        <article className={commonStyles.content}>
          <header className={styles.headerContainer}>
            <h1>{post.data.title}</h1>
            <div>
              <div>
                <FiCalendar />
                <time>{formatDate(post.first_publication_date)}</time>
              </div>
              <div>
                <FiUser /> <span>{post.data.author}</span>
              </div>
              <div>
                <FiClock />
                <span>4 min</span>
              </div>
            </div>
          </header>
          {post.data.content.map(dataContent => (
            <div key={dataContent.heading}>
              <h2>{dataContent.heading}</h2>
              <div
                className={styles.articleContent}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(dataContent.body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');
  const posts = postsResponse.results;
  if (posts.length > 2) posts.length = 2;
  return {
    paths: posts.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const { first_publication_date, data, uid } = await prismic.getByUID(
    'posts',
    String(slug),
    {}
  );
  return {
    props: { post: { first_publication_date, data, uid } },
  };
};
