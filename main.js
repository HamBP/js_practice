var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
    HTML: (title, list, body, control) => {
        return `
        <!doctype html>
        <html>
        <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1><a href="/">WEB</a></h1>
            ${list}
            ${control}
            ${body}
        </body>
        </html>`;
    },
    list: filelist => {
        var list = '<ul>';
        var i = 0;
        while(i < filelist.length){
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list+'</ul>';
        return list;
    }
};
 
var app = http.createServer((request,response) => {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){
        if(queryData.id === undefined){     // 홈 페이지
            fs.readdir('./data', function(error, filelist){
            var list = template.list(filelist);
            var html = template.HTML(title, list, 
                `<h2>Welcome</h2>Hello, Node.js`, 
                `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
            })
        } else {                            // 그 외 페이지 id로 구분
        fs.readdir('./data', function(error, filelist){
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.HTML(title, list, 
                    `<h2>${title}</h2>${description}`, 
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a> <a href="/delete">delete</a>`);
                response.writeHead(200);
                response.end(html);
                });
            });
        }
        
    } else if(pathname === '/create') {
        fs.readdir('./data', function(error, filelist){
            var title = 'Web - create';
            var list = template.list(filelist);
            var html = template.HTML(title, list,
                `<form action="https://3000-d3d840ef-86ad-40c5-a8a9-03af076414e9.ws-us02.gitpod.io/create_process" method="POST">
                <input type="text" name="title" placeholder="제목"><br>
                <textarea name="description" id="" cols="30" rows="10" placeholder="내용"></textarea><br>
                <input type="submit">
                </form>`, '');
            response.writeHead(200);
            response.end(html);
        })
    } else if(pathname === '/create_process') {
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`./data/${title}`, description, 'utf8', err => {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
            });
        });
    } else if(pathname === '/update') {
        fs.readdir('./data', function(error, filelist){
            fs.readFile(`./data/${queryData.id}`, 'utf8', function(err, description){
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.HTML(title, list, 
                    `<form action="https://3000-d3d840ef-86ad-40c5-a8a9-03af076414e9.ws-us02.gitpod.io/update_process" method="POST">
                    <input type="hidden" name="id" value="${title}"></input>
                    <input type="text" name="title" placeholder="제목" value="${title}"><br>
                    <textarea name="description" id="" cols="30" rows="10" placeholder="내용">${description}</textarea><br>
                    <input type="submit">
                    </form>`, 
                    `<a href="/create">create</a> <a href="/update">update</a> <a href="/delete">delete</a>`);
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process') {
        console.log("A");
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`./data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`./data/${title}`, description, 'utf8', err => {
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
            })
            console.log(post);
            });
        });
    } else { // 404 not found error
        response.writeHead(404);
        response.end('Not found');
    }
 
});
app.listen(3000);