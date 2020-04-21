require('dotenv-safe').config()
const csv = require('csv-parser')
const path = require('path')
const fs = require('fs');
const uuid = require('uuid')

const initMongo = require('../../config/mongo')

// Init MongoDB
initMongo()

const Test = require('../models/test')
const Event = require('../models/event')

function start() {
  // const test = new Test({
  //   // name: ['abc', 'asd']
  // })
  // test.save((err, item) => {
  //   if (err) {
  //     reject(err)
  //   }

  //   console.log(item)
  // })
  Event.updateMany({}, {
    $set: {
      notes: `1.本課程以15-29歲青年為優先名對象。
2.填寫報名資料不代表報名成功，報名成功者將於活動前3-5天以簡訊通知。活動當天憑報名成功簡訊入場。
3.已報名成功者，若欲取消活動，請務必提前兩天來電取消 07-2313232。
4.報名資料為本中心及講師為了解學員背景規劃活動內容所需，請詳細填寫。
5.免費講座資源珍貴，報名後勿無故缺席，以免資源浪費，影響他人參加權益！
6.參與講座請務必準時，活動開始後10分鐘不予入場。
7.為維護活動品質，講座不開放現場報名、候補及旁聽，活動期間手機請關機或轉為震動。
8.若需YS提供「服務學習時數認證」請於活動前告知工作同仁，並依照當天上課學習狀況，評核是否提供蓋章認證。
9.YS保留修改活動與細節權利，以YS公告為主。`
    }
  }, { "multi": true }, (err, result) => {
      if (err) console.log(err)

      console.log('result, ', result);
  })
}

start()
