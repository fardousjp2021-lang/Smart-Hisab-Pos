import http from 'http';

http.get('http://localhost:3000/', (res) => {
  console.log('STATUS:', res.statusCode);
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTML Length:', html.length);
    if (html.includes('id="root"')) {
      console.log('Root container element is present!');
    }
  });
}).on('error', (err) => console.log('ERROR:', err.message));
