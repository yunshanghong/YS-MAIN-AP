require('dotenv-safe').config()
const csv = require('csv-parser')
const path = require('path')
const fs = require('fs');
const uuid = require('uuid')
 
const initMongo = require('../../config/mongo')

// Init MongoDB
initMongo()

const User = require('../models/user')
const Information = require('../models/information')

let counter = 0;
let errorList = []

async function start() {
  console.time('db')
    
  // fs.createReadStream(path.resolve(__dirname, 'my_information_data.csv'))
  // .pipe(csv())
  //   .on('data', async row => {
  //     try {

  //       const newInformation = {
  //         title: '',
  //         createdAt: '2019-08-23',
  //       }

  //       await updateInformation(newInformation)

  //       console.log(`${row.displayName} with Email ${row.email} Created`)
        
  //     } catch (err) {
  //       errorList.push(row)
  //       console.log(`${row.displayName} with Email ${row.email} Failed`)
  //     }
  //   })
  //   .on('end', () => {
  //     console.log('No more rows!');
  //     console.log('errorList, ', errorList);
  //   });

  const newInformation = {
          title: 'tetet',
          createdAt: '2019-08-23',
        }

        await updateInformation(newInformation)

    console.timeEnd('db')

}

const updateInformation = async req => {
  return new Promise((resolve, reject) => {
    Information.updateOne(
      { title: req.title },
      { createdAt: new Date(req.createdAt) },
        {
          new: true,
          runValidators: true,
        },
        (err, item) => {
        if (err) {
            reject(err)
          }

          console.log('item, ', item);
          
          resolve(item)
        }
      )
  })
}


start();
