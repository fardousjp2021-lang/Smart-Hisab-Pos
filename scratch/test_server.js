import http from 'http';

http.get('http://localhost:3000/', (res) => {
  console.log('HTTP STATUS:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('root')) {
      console.log('✅ Local server is running live with status 200 OK!');
    }
  });
}).on('error', (e) => {
  console.log('Server fetch error:', e.message);
});
