import '../styles/main.scss';

if (process.env.NODE_ENV !== 'production') {
  require('../pages/index.pug');
  require('../pages/Main/main.pug');
  require('../pages/Other/other.pug');
}
