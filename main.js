const express = require("express");
const app = express();
var fs = require("fs");
var template = require("./lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");
var qs = require("querystring");

//route, routing
app.get("/", (request, response) => {
    fs.readdir("./data", function (error, filelist) {
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = template.list(filelist);
        var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
        response.send(html);
    });
});
/* 위 코드와 동일함
app.get('/', function(req, res) {
   return  res.send('Hello World!');
});
*/

app.get("/page/:pageID", (request, response) => {
    fs.readdir("./data", function (error, filelist) {
        var filteredId = path.parse(request.params.pageID).base;
        fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
            var title = request.params.pageID;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ["h1"],
            });
            var list = template.list(filelist);
            var html = template.HTML(
                sanitizedTitle,
                list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                ` <a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
                </form>`
            );
            response.send(html);
        });
    });
});

app.get("/create", (request, response) => {
    fs.readdir("./data", function (error, filelist) {
        var title = "WEB - create";
        var list = template.list(filelist);
        var html = template.HTML(
            title,
            list,
            `
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                <input type="submit">
                </p>
            </form>
            `,
            ""
        );
        response.send(html);
    });
});

app.post("/create_process", (request, response) => {
    var body = "";
    request.on("data", function (data) {
        body = body + data;
    });
    request.on("end", function () {
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, "utf8", function (err) {
            response.writeHead(302, { Location: `/?id=${title}` });
            response.end();
        });
    });
});

app.get("/update/:pageID", function (request, response) {
    fs.readdir("./data", function (error, filelist) {
        var filteredId = path.parse(request.params.pageID).base;
        fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
            var title = request.params.pageID;
            var list = template.list(filelist);
            var html = template.HTML(
                title,
                list,
                `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                    <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                    <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
            );
            response.send(html);
        });
    });
});

app.post("/update_process", function (request, response) {
    var body = "";
    request.on("data", function (data) {
        body = body + data;
    });
    request.on("end", function () {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function (error) {
            fs.writeFile(`data/${title}`, description, "utf8", function (err) {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            });
        });
    });
});

app.listen(3000, () => console.log("Example app listening on port 3000"));

/* var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    
    else if (pathname === "/delete_process") {
        var body = "";
        request.on("data", function (data) {
            body = body + data;
        });
        request.on("end", function () {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function (error) {
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end("Not found");
    }
});
app.listen(3000);
 */
