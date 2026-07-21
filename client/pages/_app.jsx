import 'bootstrap/dist/css/bootstrap.min.css';
import BuildClient from '../api/build-client';

import Header from '../components/header';

const MyApp = ({ Component, pageProps }) => {
  // Extract currentUser safely out of pageProps
  const { currentUser } = pageProps;

  return (
    <div>
      <Header currentUser={currentUser} />
      <div className='container'>
        <Component {...pageProps} />
      </div>
    </div>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const client = BuildClient(appContext.ctx);

  let data = { currentUser: null };
  try {
    const response = await client.get('/api/users/currentuser');
    data = response.data;
  } catch (err) {
    console.error('Failed to fetch current user:', err.message);
  }

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // Pass client down so sub-pages don't have to rebuild it
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser,
    );
  }

  //  Bundle currentUser inside pageProps cleanly
  return {
    pageProps: {
      ...pageProps,
      currentUser: data.currentUser,
    },
  };
};

export default MyApp;
