// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow:{
      type:Boolean,
      value:false
    },
    lyric:String
  },
  observers:{
    lyric(lrc){
      console.log(lrc)
      if(lrc == '暂无歌词'){
        this.setData({
          lrcList:[{
            lrc,
            time:0
          }],
          nowLyricIndex:-1
        })
      }else {
        this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList:[],
    nowLyricIndex:0,
    scrollTop:0
  },
  lifetimes:{
    ready(){
      wx.getSystemInfo({
        success: (res) => {
          // console.log(res)
          lyricHeight = res.screenHeight / 750 * 60
        },
      })
    }
    },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime){
      let lrcList = this.data.lrcList
      // console.log(currentTime)
      for (let i = 0;i < lrcList.length; i++){
        if(currentTime > lrcList[lrcList.length-1].time){
          if(this.data.nowLyricIndex != -1){
            this.setData({
              nowLyricIndex:-1,
              scrollTop:(lrcList.length-1) * lyricHeight
            })
          }
        }
        if(currentTime <= lrcList[i].time){
          this.setData({
            nowLyricIndex:i-1,
            scrollTop:(i-1) * lyricHeight
          })
          break
        }
        
      }
    },
    _parseLyric(sLyric){
      let line = sLyric.split('\n')
      const _lrcList = []
      line.forEach((elem) => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        // console.log(time)
        if(time != null){
          let lrc = elem.split(time)[1]
          console.log(lrc)
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // console.log(timeReg)
          let seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time:seconds
          })
        }
      })
      this.setData({
        lrcList:_lrcList
      })
      // console.log(_lrcList)
      // console.log(this.data.lrcList)
    }
  }
})
