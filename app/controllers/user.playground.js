require('dotenv-safe').config()
const csv = require('csv-parser')
const path = require('path')
const fs = require('fs');
const uuid = require('uuid')
 
const initMongo = require('../../config/mongo')

// Init MongoDB
initMongo()

const User = require('../models/user')

let errorCounter = 0;
let errorList = []

const START_NO = 1
const END_NO   = 1000

function step1() {
  console.time('step1')
    
  fs.createReadStream(path.resolve(__dirname, '2020-detail.csv'))
  .pipe(csv())
    .on('data', async row => {
      if (START_NO <= parseInt(row.no) && parseInt(row.no) <= END_NO) {
        try {
          const newUser = {
            email: row['信箱'],
            displayName: row['中文姓名'],
            password: row['生日'].split('-').join(""),
          }

          // console.log('newUser, ', newUser);
  
          await registerUser(newUser)
  
          console.log(`${row['中文姓名']} with Email ${row['信箱']} Created`)
          
        } catch (err) {
          errorList.push(row)
          errorCounter++
          console.log(`${row['中文姓名']} with Email ${row['信箱']} Failedddddddddddddddddddddddddddddddddddddddddddddddddddddd`)
          console.log('errorList, ', errorList);
        }
      }
    })
    .on('end', () => {
      console.log('No more rows!');
    });

    console.timeEnd('step1')

}


function step2() {
  console.time('step2')
    
  fs.createReadStream(path.resolve(__dirname, '2020-detail.csv'))
  .pipe(csv())
    .on('data', async row => {
      if (START_NO <= parseInt(row.no) && parseInt(row.no) <= END_NO) {
        try {
          const findRule = {
            email: row['信箱'],
          }
          
          const updateData = {
            gender: row['性別'] === '男' ? 'male' : 'female',
            // gender: row['性別'],
            bob: new Date(row['生日']),
            phone: '0' + row['手機'],
            education: educationConverter(row['最高學歷']),
            schoolName: row['學校名稱'],
            employmentStatus: employmentStatusConverter(row['目前工作狀態']),
            city: row['居住縣市'],
            postAddress: row['詳細地址']
          }

          // console.log('updateData, ', updateData);

          await updateUser({ findRule, updateData })
  
          console.log(`${row['中文姓名']} with Email ${row['信箱']} Updated`)
          
        } catch (err) {
          console.log('err, ', err);
          errorList.push(row)
          errorCounter++
          console.log(`${row['中文姓名']} with Email ${row['信箱']} Failedddddddddddddddddddddddddddddddddddddddddddddddddddddd`)
          console.log('errorList, ', errorList);
        }
      }
    })
    .on('end', () => {
      console.log('No more rows!');
    });

    console.timeEnd('step2')

}


function temp() {
  console.time('step2')
    
  fs.createReadStream(path.resolve(__dirname, '2020-detail.csv'))
  .pipe(csv())
    .on('data', async row => {
      if (START_NO <= parseInt(row.no) && parseInt(row.no) <= END_NO) {
        try {
          const findRule = {
            email: row['信箱'],
          }
          
          await deleteUser({ findRule })
  
          console.log(`${row['中文姓名']} with Email ${row['信箱']} Updated`)
          
        } catch (err) {
          console.log('err, ', err);
          errorList.push(row)
          errorCounter++
          console.log(`${row['中文姓名']} with Email ${row['信箱']} Failedddddddddddddddddddddddddddddddddddddddddddddddddddddd`)
          console.log('errorList, ', errorList);
        }
      }
    })
    .on('end', () => {
      console.log('No more rows!');
    });

    console.timeEnd('step2')

}

const registerUser = async req => {
  return new Promise((resolve, reject) => {
    const user = new User({
      displayName: req.displayName,
      email: req.email,
      password: req.password,
      verification: uuid.v4()
    })
    user.save((err, item) => {
      if (err) {
        reject(err)
      }
      
      resolve(item)
    })
  })
}
const updateUser = async ({findRule, updateData}) => {
  return new Promise((resolve, reject) => {
    User.findOneAndUpdate(
      findRule,
        updateData,
        {
          new: true,
          runValidators: true
        },
        (err, item) => {
          if (err) reject(err)
          resolve(item)
        }
    )
  })
}
const deleteUser = async ({ findRule }) => {
  return new Promise((resolve, reject) => {
    User.deleteOne(findRule).then((item) => {
      resolve(item)
    }).catch(err => {
      reject(err)
    })
  })
}

const educationConverter = (edu) => {
  // new      => 國中、高中、高職、專科、大學(包含四技、二技)、研究所、其他
  switch (edu) {
    case '國中':
      return 'middle';
    case '高中(職)':
      return 'high'
    case '專科':
      return 'faculty';
    case '大學(二技、四技)':
      return 'bachelor';
    case '研究所':
      return 'institute';
    case '其他':
    default:
      return 'other';
  }
}
const employmentStatusConverter = (status) => {
  // 'student', 'employed', 'unemployed', 'other'
  switch (status) {
    case '在學':
      return 'student';
    case '在職':
      return 'employed'
    case '待業':
      return 'unemployed';
    case '其他':
    default:
      return 'other';
  }
}

// step1();
step2();
// temp()

// var start = new Date('2020-03-11');
// start.setHours(0,0,0,0);

// var end = new Date('2020-03-11');
// end.setHours(23,59,59,999);

// User.deleteMany({ createdAt: {$gte: start, $lt: end} }).then((item) => {
//   console.log('item, ', item);
// })
