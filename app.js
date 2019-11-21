const Koa = require('koa'),
      app = new Koa,
      router = require('koa-router')(),
      views = require('koa-views'),
      bodyParser = require('koa-bodyparser'),
      serve = require('koa-static'),
      session = require('koa-session'),
      DB = require('./module/db');

const CONFIG = {
  key: 'koa:sess', //默认
  maxAge: 86400000, //cookie 过期时间，【需要修改】
  autoCommit: true, //自动提交邮件头
  overwrite: true, //没有效果，默认
  httpOnly: true, //true表示只有服务器端能获取cookie
  signed: true, //默认签名
  rolling: false, //在每次请求时强行设置cookie
  renew: false, //快要过期端时候设置，【需要修改】
};

app.use(views('views', {extension: 'ejs'}));
app.use(bodyParser());
app.use(serve('static'));
app.keys = ['some secret hurr'];
app.use(session(CONFIG, app));

app.use(async (ctx, next) => {
  ctx.state.title = 'koa操作数据库';// 设置全局数据
  await next();
  if (ctx.status === 404) ctx.body = 'error: 404';
});

router
  .get('/', async ctx => {
    ctx.session.token = 'admin';
    let result = await DB.find('test_01');
    await ctx.render('index', {
      list: result
    });
  })
  .get('/search', async ctx => {
    if (ctx.query.name === '') return ctx.redirect('/');
    let result = await DB.find('test_01', ctx.query);
    await ctx.render('index', {
      list: result
    });
  })
  .get('/userAdd', async ctx => {
    await ctx.render('userAdd');
  })
  .post('/doAdd', async ctx => {
    let result = await DB.insert('test_01', ctx.request.body);
    try {
      if (result.result.ok) ctx.redirect('/');
    }
    catch(err) {
      console.log('err=', err)
    }
  })
  .get('/delete/:id', async ctx => {
    let result = await DB.remove('test_01', ctx.params);
    try {
      if (result.result.ok) ctx.redirect('/');
    }
    catch(err) {
      console.log(err)
    }
  })
  .get('/userInfo/:id', async ctx => {
    let result = await DB.find('test_01', ctx.params);
    await ctx.render('userInfo', {
      data: result[0]
    });
  })
  .post('/update', async ctx => {
    let result = await DB.update('test_01', {id: ctx.request.body.id}, ctx.request.body);
    try {
      if (result.result.ok) ctx.redirect('/');
    }
    catch(err) {
      console.log(err)
    }
  })
  
  // 接口形式
  .get('/getList', async ctx => {
    ctx.body = {
      status: 200,
      data: await DB.find('test_01')
    }
  });

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8000);
console.log('—— listening on port 8000 ——');