const http = require('http');
const { URL } = require('url');
const bodyParser = require('./helpers/bodyParser');
// const url = require('url');

const routes = require('./routes');

const server = http.createServer((request, response) => {
  console.log(`Endpoint: ${request.url} | Method: ${request.method}`);

  // const parsedUrl = url.parse(request.url, true);
  const parsedUrl = new URL(`http://localhost:3000${request.url}`);
  let { pathname } = parsedUrl;
  let id = null;

  const splitedUrl = pathname.split('/').filter(Boolean);

  if (splitedUrl.length > 1) {
    pathname = `/${splitedUrl[0]}/:id`;
    id = splitedUrl[1];
  }

  const route = routes.find(routeObject => routeObject.endpoint === pathname && routeObject.method === request.method);

  if (route) {
    request.query = Object.fromEntries(parsedUrl.searchParams);
    request.params = { id };

    response.send = (statusCode, body) => {
      response.writeHead(statusCode, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(body));
    }

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      bodyParser(request, () => route.handler(request, response));
    } else {
      route.handler(request, response);
    }

  } else {
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end(`Cannot ${request.method} ${pathname}`);
  }

})

server.listen(3000, () => console.log('Servidor rodando na porta 3000'));