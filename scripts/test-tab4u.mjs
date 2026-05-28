import { fetchTab4uSongContent } from '../src/utils/tab4uServer.js';

const result = await fetchTab4uSongContent('I Love You So', 'The Walters');
console.log('source', result?.sourceUrl);
console.log('lines', result?.content?.split('\n').length);
console.log(result?.content?.slice(0, 400));
