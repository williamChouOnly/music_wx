// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

const MAX_DATA = 100
// 云函数入口函数
exports.main = async(event, context) => {
  // const list = await playlistCollection.get()
  const count = await playlistCollection.count()
  const total = count.total
  const times = Math.ceil(total / MAX_DATA)
  const tasks = []
  for(let i = 0;i < times; i++){
    let promise = playlistCollection.skip(i * MAX_DATA).limit(MAX_DATA).get()
    tasks.push(promise)
  }
 let list={
    data:[]
  }
  if(tasks.length > 0){
    list = (await Promise.all(tasks)).reduce((acc,cur) => {
      return{
        data: acc.data.concat(cur.data)
      }
    })
  }
 
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  const newData = []
  for(let i = 0;i < playlist.length;i++){
    let flag = true
    for(let j = 0;j < list.data.length;j++){
      if(playlist[i].id === list.data[j].id){
        flag = false
        break
      }
    }
    if(flag){
      newData.push(playlist[i])
    }
  }
    for(let i = 0;i < newData.length;i++){
      await playlistCollection.add({
        data:{
          ...newData[i],
          createTime:db.serverDate()
        }
      }).then((res) => {
        console.log('插入成功')
      }).catch((err) => {
        console.log('插入失败')

      })

    }
    return newData.length
}
