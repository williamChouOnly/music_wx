// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()

const blogCollection = db.collection('blog')

const MAX_COUNT_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
app.router('list',async(ctx,next) => {
  const keyword = event.keyword
  let w = {}
  if(keyword.trim() != ''){
    w = {
      content:new db.RegExp({
        regexp:keyword,
        options:'i'
      })
    }
  }
  let blogList = await blogCollection.where(w).skip(event.start).limit(event.count).orderBy('createTime','desc').get().then((res) => {
    return res.data
  })
  ctx.body = blogList 
})


app.router('detail',async(ctx,next) => {
  const blogId = event.blogId
  //博客详情查询
  let detail = await blogCollection.where({
    _id:blogId
  }).get().then((res) =>{
    return res.data
  })
  //评论查询
  const countResult = await db.collection('blog-comment').count()
  const total = countResult.total
  let commentList = {
    data:[]
  }
  if(total > 0){
    const batchTimes = Math.ceil(total / MAX_COUNT_LIMIT)
    const tasks = []
    for(let i = 0;i < batchTimes;i++){
      let promise = await db.collection('blog-comment')
                    .where({
                    blogId
                    }).orderBy('createTime', 'desc').skip(i * MAX_COUNT_LIMIT).limit(MAX_COUNT_LIMIT).get()
      tasks.push(promise)

      if(tasks.length > 0){
        commentList = (await Promise.all(tasks)).reduce((acc,cur) => {
          return{
            data:acc.data.concat(cur.data)
          }
        })
        }
    }
    
    }
  ctx.body = {
    detail,
    commentList
  }
})


  return app.serve()
}